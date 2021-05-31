import { useContext, useEffect, useRef, createContext, ReactNode } from "react";
import { Presence } from "phoenix";
import { useHistory, useLocation } from "react-router-dom";
import { useAlert } from "react-alert";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useChannel } from "utils/socketUtils";
import { gameActions } from "features/game/gameSlice";

export const GameContext = createContext({
  broadcast: (_eventName: string, _payload?: any) => {},
});

type Props = { gameId?: string; children?: ReactNode };

const PRESENCE_EVENTS = {
  state: "presence_state",
  diff: "presence_diff",
};

export const GameProvider = ({ children, gameId }: Props) => {
  const storedGameId = useAppSelector((state) => state.game.gameId);
  const presencesRef = useRef({});
  const history = useHistory();
  const location = useLocation();
  const alert = useAlert();
  const dispatch = useAppDispatch();
  const { broadcast, connected, error } = useChannel(
    `game:${gameId}`,
    {
      name: localStorage.getItem("name"),
      isSpectator: location.pathname.includes("spectate"),
    },
    (event, payload) => {
      if (event === PRESENCE_EVENTS.state || event === PRESENCE_EVENTS.diff) {
        if (event === PRESENCE_EVENTS.state) {
          presencesRef.current = payload;
        } else {
          presencesRef.current = Presence.syncDiff(
            presencesRef.current,
            payload
          );
        }
        const players = Presence.list(presencesRef.current)
          .map((p) => p.metas[0])
          .filter((p) => !p.isSpectator);
        dispatch({ type: "game/players", payload: { players } });
      } else {
        dispatch({ type: event, payload });
      }
    }
  );

  useEffect(() => {
    if (!storedGameId && gameId) {
      dispatch(gameActions.new_game({ gameId }));
    }
    if (error) {
      dispatch(gameActions.reset({ gameId: undefined }));
      alert.show(`Error connecting to game ${gameId}`);
      history.push("/");
    }
  }, [storedGameId, gameId, error]);

  useEffect(() => {
    const inviteUsersFrom = localStorage.getItem("lastGameId");
    if (connected && inviteUsersFrom) {
      broadcast("invite", { game_code: inviteUsersFrom, new_code: gameId });
      dispatch(gameActions.invite({ gameId: undefined }));
    }
  }, [connected]);

  if (!connected) return null;
  return (
    <GameContext.Provider value={{ broadcast }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameChannel = () => {
  return useContext(GameContext);
};
