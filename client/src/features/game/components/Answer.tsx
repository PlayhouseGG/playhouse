import { useState, SyntheticEvent } from "react";
import styled from "styled-components";
import { theme } from "styles/theme";
import { Input, Button, SingleLetterInput } from "components";
import {
  SceneAnswer,
  Submission,
  AnswerTypeSlugs,
} from "features/game/gameSlice";

type AnswerProps = {
  sceneAnswer: SceneAnswer;
  answerType: string;
  submitted: boolean;
  onSubmit: (submission: Pick<Submission, "content">) => void;
  displayMode?: boolean;
};

export const Answer = (props: AnswerProps) => {
  switch (props.answerType) {
    case AnswerTypeSlugs.multiText.id:
      return <AnswerMulti {...props} />;
    case AnswerTypeSlugs.letterText.id:
      return <AnswerLetter {...props} />;
    default:
      return <AnswerText {...props} />;
  }
};

const getDisplayClassName = (isCorrect: boolean) => {
  return `display-text ${isCorrect ? "correct" : ""}`;
};

const AnswerText = ({
  sceneAnswer,
  submitted,
  onSubmit,
  displayMode,
}: AnswerProps) => {
  const [value, setValue] = useState("");

  const submit = (e: SyntheticEvent) => {
    e.preventDefault();
    onSubmit({ content: value });
  };

  if (displayMode) {
    return (
      <AnswerDisplay className={getDisplayClassName(sceneAnswer.isCorrect)}>
        {sceneAnswer.content}
      </AnswerDisplay>
    );
  }

  return (
    <AnswerTextForm onSubmit={submit}>
      <InputContainer>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={submitted}
          autoFocus
          fullWidth
        />
      </InputContainer>
      <Button type="submit" disabled={!value || submitted}>
        Submit answer
      </Button>
    </AnswerTextForm>
  );
};

const AnswerLetter = ({
  sceneAnswer,
  submitted,
  onSubmit,
  displayMode,
}: AnswerProps) => {
  const [value, setValue] = useState(" ".repeat(sceneAnswer.content.length));

  const submit = (e: SyntheticEvent) => {
    e.preventDefault();
    onSubmit({ content: value });
  };

  if (displayMode) {
    return (
      <AnswerDisplay className={getDisplayClassName(sceneAnswer.isCorrect)}>
        {sceneAnswer.content}
      </AnswerDisplay>
    );
  }

  return (
    <AnswerTextForm onSubmit={submit}>
      <InputContainer>
        <SingleLetterInput
          value={value}
          onLetterChange={(value) => setValue(value)}
          autoFocus
        />
      </InputContainer>
      <Button type="submit" disabled={!value || submitted}>
        Submit answer
      </Button>
    </AnswerTextForm>
  );
};

const AnswerTextForm = styled.form`
  text-align: center;
  width: 100%;
`;

const InputContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${theme.spacings(3)};
`;

const AnswerMulti = ({
  sceneAnswer,
  submitted,
  onSubmit,
  displayMode,
}: AnswerProps) => {
  if (displayMode) {
    return (
      <AnswerDisplay className={getDisplayClassName(sceneAnswer.isCorrect)}>
        {sceneAnswer.content}
      </AnswerDisplay>
    );
  }

  return (
    <Button
      key={sceneAnswer.id}
      disabled={submitted}
      onClick={() => onSubmit({ content: sceneAnswer.content })}
      fullWidth
    >
      {sceneAnswer.content}
    </Button>
  );
};

const AnswerDisplay = styled.div`
  font-size: 1.2rem;
  text-align: center;
  padding: ${theme.spacings(3)};
  border: 2px solid ${theme.ui.borderColorAlternate};
  border-radius: ${theme.ui.borderWavyRadius};
`;

// import CanvasDraw from "react-canvas-draw";
// import { HexColorPicker } from "react-colorful";

/**
<RecordContainer>
<Record onTranscribe={(value) => setValue(value)} autoStart />
</RecordContainer>

const RecordContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  opacity: 0.3;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  > p {
    margin: 0;
  }
`;
**/

// const AnswerCanvas: React.FC<
//   AnswerProps & { height?: number; width?: number }
// > = ({ submitted = false, onSubmit = () => {}, width, height }) => {
//   const canvas = createRef<CanvasDraw>();

//   const handleClick = () => {
//     const data = canvas?.current?.getSaveData();
//     onSubmit(data);
//   };

//   return (
//     <Box textAlign="center">
//       <Box mb={3}>
//         <CanvasDraw
//           ref={canvas}
//           brushRadius={5}
//           lazyRadius={5}
//           canvasWidth={width || window.innerWidth}
//           canvasHeight={height || window.innerHeight - 250}
//         />
//       </Box>
//       <Button disabled={submitted} onClick={handleClick}>
//         Submit answer
//       </Button>
//     </Box>
//   );
// };

// const AnswerColor: React.FC<AnswerProps> = ({
//   submitted = false,
//   onSubmit = () => {},
// }) => {
//   const [color, setColor] = useState("#ffffff");

//   const handleClick = () => {
//     onSubmit(color);
//   };

//   return (
//     <ColorPickerContainer>
//       <HexColorPicker color={color} onChange={setColor} />
//       <Button disabled={!color || submitted} onClick={handleClick}>
//         Submit answer
//       </Button>
//     </ColorPickerContainer>
//   );
// };

// const ColorPickerContainer = styled.div`
//   .react-colorful {
//     margin-bottom: ${ theme.spacings(2)};
//   }
// `;

// const HexColor = styled.div<{ hex?: string }>`
//   width: 30px;
//   height: 30px;
//   border-radius: 30px;
//   background-color: ${(props) => props.hex ?? "transparent"};
//   margin: 0 auto;
// `;
