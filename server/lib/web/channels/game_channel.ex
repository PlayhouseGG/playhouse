defmodule Web.GameChannel do
  @moduledoc """
  Channel clients join via game code to play game game
  """

  use Web, :channel

  alias Web.Presence
  alias Game.GameServer

  @doc """
  Join game with game code
  """
  def join("game:" <> game_code, payload, socket) do
    case GameServer.game_pid(game_code) do
      pid when is_pid(pid) ->
        send(self(), {:after_join, game_code, payload["name"], payload["isSpectator"]})
        {:ok, assign(socket, :name, payload["name"])}

      nil ->
        {:error, %{reason: "Game does not exist"}}
    end
  end

  @doc """
  Presence is tracked and initial game state broadcasted
  """
  def handle_info({:after_join, game_code, name, is_spectator}, socket) do
    push(socket, "presence_state", Presence.list(socket))

    {:ok, _} =
      Presence.track(socket, socket.assigns.name, %{
        name: name,
        isSpectator: is_spectator,
        score: 0
      })

    game_state =
      case is_spectator == true do
        true ->
          GameServer.game_state(game_code)

        false ->
          player = %{name: name, score: 0}
          GameServer.player_new(game_code, player)
      end

    broadcast!(socket, "game/game_state", game_state)
    {:noreply, socket}
  end

  @doc """
  Triggered from lobby once everyone has joined
  """
  def handle_in("start", _payload, socket) do
    "game:" <> game_code = socket.topic

    case GameServer.game_pid(game_code) do
      pid when is_pid(pid) ->
        game_state = GameServer.game_start(game_code)
        broadcast!(socket, "game/game_state", game_state)
        {:noreply, socket}

      nil ->
        {:reply, {:error, %{reason: "Game does not exist"}}, socket}
    end
  end

  @doc """
  Triggered on last scene of game. In future this will take game state
  and store it into database.
  """
  def handle_in("end", _payload, socket) do
    "game:" <> game_code = socket.topic

    case GameServer.game_pid(game_code) do
      pid when is_pid(pid) ->
        # TODO: Save game state to DB
        # end_game_state = GameServer.game_end(game_code)
        # pack = Live.pack_get(end_game_state.pack)
        # Live.play_create(pack, %{game_state: end_game_state})
        {:noreply, socket}

      nil ->
        {:reply, {:error, %{reason: "Game does not exist"}}, socket}
    end
  end

  @doc """
  Increments step in game state
  """
  def handle_in("step:next", _payload, socket) do
    "game:" <> game_code = socket.topic

    case GameServer.game_pid(game_code) do
      pid when is_pid(pid) ->
        game_state = GameServer.step_next(game_code)
        broadcast!(socket, "game/game_state", game_state)
        {:noreply, socket}

      nil ->
        {:reply, {:error, %{reason: "Game does not exist"}}, socket}
    end
  end

  @doc """
  Increments scene in game state
  """
  def handle_in("scene:next", _payload, socket) do
    "game:" <> game_code = socket.topic

    case GameServer.game_pid(game_code) do
      pid when is_pid(pid) ->
        game_state = GameServer.scene_next(game_code)
        broadcast!(socket, "game/game_state", game_state)
        {:noreply, socket}

      nil ->
        {:reply, {:error, %{reason: "Game does not exist"}}, socket}
    end
  end

  @doc """
  Player's guess to the question
  """
  def handle_in("submit", %{"name" => name, "submission" => submission}, socket) do
    "game:" <> game_code = socket.topic

    case GameServer.game_pid(game_code) do
      pid when is_pid(pid) ->
        game_state = GameServer.player_submit(game_code, name, submission, player_count(socket))
        player_score_update(socket, name, game_state.players)
        broadcast!(socket, "game/game_state", game_state)
        {:noreply, socket}

      nil ->
        {:reply, {:error, %{reason: "Game does not exist"}}, socket}
    end
  end

  @doc """
  Send message to players in a game to join new game
  """
  def handle_in("invite", %{"game_code" => game_code, "new_code" => new_code}, socket) do
    case GameServer.game_pid(game_code) do
      pid when is_pid(pid) ->
        # this should broadcast to the game:game_code topic
        Web.GameChannel.broadcast_from!(self(), game_code, "game/invite", %{gameId: new_code})
        {:noreply, socket}

      nil ->
        {:reply, {:error, %{reason: "Game does not exist"}}, socket}
    end
  end

  # List of actively connected players used to determine if everyone is
  # done submitting or endorsing
  defp player_count(socket) do
    Presence.list(socket)
    |> Map.values()
    |> Enum.filter(&(Enum.at(&1.metas, 0).isSpectator === false))
    |> Enum.count()
  end

  # Update player's score based on game state
  defp player_score_update(socket, name, players) do
    score =
      Enum.filter(players, fn x -> x.name === name end)
      |> Enum.at(0)
      |> Map.get(:score)

    player =
      Presence.list(socket)
      |> Map.get(name)
      |> Map.get(:metas)
      |> Enum.at(0)

    Presence.update(socket, name, %{player | score: score})
  end
end
