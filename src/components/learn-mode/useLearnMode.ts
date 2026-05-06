import { useReducer, useMemo, useEffect, useRef } from "react";
import { Vocabulary } from "@prisma/client";
import { updateVocabularyBatchStatus } from "@/services/learn-mode-api";
import { toast } from "sonner";

interface LearnState {
  vocabularies: Vocabulary[];
  currentIndex: number;
  isFlipped: boolean;
  isFlipping: boolean;
  showWordFirst: boolean;
  showPronunciation: boolean;
  swipeDirection: "left" | "right" | null;
  previousIndex: number | null;
}

type LearnAction =
  | { type: "SET_VOCABULARIES"; payload: Vocabulary[] }
  | { type: "SET_CURRENT_INDEX"; payload: number }
  | { type: "TOGGLE_FLIP" }
  | { type: "SET_FLIPPING"; payload: boolean }
  | { type: "TOGGLE_WORD_FIRST" }
  | { type: "TOGGLE_PRONUNCIATION" }
  | { type: "SET_SWIPE"; payload: { direction: "left" | "right" | null; previousIndex: number | null } }
  | { type: "RESET" };

const learnReducer = (state: LearnState, action: LearnAction): LearnState => {
  switch (action.type) {
    case "SET_VOCABULARIES":
      return { ...state, vocabularies: action.payload };
    case "SET_CURRENT_INDEX":
      return { ...state, currentIndex: action.payload };
    case "TOGGLE_FLIP":
      return { ...state, isFlipped: !state.isFlipped };
    case "SET_FLIPPING":
      return { ...state, isFlipping: action.payload };
    case "TOGGLE_WORD_FIRST":
      return { ...state, showWordFirst: !state.showWordFirst };
    case "TOGGLE_PRONUNCIATION":
      return { ...state, showPronunciation: !state.showPronunciation };
    case "SET_SWIPE":
      return { ...state, swipeDirection: action.payload.direction, previousIndex: action.payload.previousIndex };
    case "RESET":
      return { ...state, currentIndex: 0, isFlipped: false, vocabularies: JSON.parse(JSON.stringify(state.vocabularies)) };
    default:
      return state;
  }
};

interface UseLearnModeProps {
  topicId: string;
  initialVocab: Vocabulary[];
  mutateTopic?: () => Promise<any>;
  mutateProjectTopics?: () => Promise<any>;
}

export const useLearnMode = ({
  topicId,
  initialVocab,
  mutateTopic,
  mutateProjectTopics,
}: UseLearnModeProps) => {
  const [state, dispatch] = useReducer(learnReducer, {
    vocabularies: JSON.parse(JSON.stringify(initialVocab)),
    currentIndex: 0,
    isFlipped: false,
    isFlipping: false,
    showWordFirst: true,
    showPronunciation: true,
    swipeDirection: null,
    previousIndex: null,
  });

  const sessionCompletedRef = useRef(false);

  const currentVocab = useMemo(
    () => state.vocabularies[state.currentIndex],
    [state.vocabularies, state.currentIndex],
  );

  const saveProgress = async (showToast = true) => {
    try {
      await updateVocabularyBatchStatus(
        topicId,
        state.vocabularies.map(({ id, status }) => ({ id, status })),
      );
      if (showToast) {
        toast.success("Progress saved!");
      }
      if (mutateTopic) {
        await mutateTopic();
      }
      if (mutateProjectTopics) {
        await mutateProjectTopics();
      }
    } catch (error) {
      toast.error("Failed to save progress.");
      console.error("Failed to save progress", error);
    }
  };

  const playAudio = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      speechSynthesis.speak(utterance);
    }
  };

  const handleCardClick = () => {
    if (state.swipeDirection) return;
    dispatch({ type: "SET_FLIPPING", payload: true });
    setTimeout(() => {
      dispatch({ type: "TOGGLE_FLIP" });
      setTimeout(() => {
        dispatch({ type: "SET_FLIPPING", payload: false });
      }, 200);
    }, 150);
  };

  const handleNext = () => {
    if (state.currentIndex < state.vocabularies.length - 1) {
      dispatch({ type: "SET_CURRENT_INDEX", payload: state.currentIndex + 1 });
      dispatch({ type: "TOGGLE_FLIP" });
    } else {
      sessionCompletedRef.current = true;
      saveProgress(true);
    }
  };

  const handlePrev = () => {
    if (state.currentIndex > 0) {
      dispatch({ type: "SET_CURRENT_INDEX", payload: state.currentIndex - 1 });
      dispatch({ type: "TOGGLE_FLIP" });
    }
  };

  const handleRemembered = () => {
    if (state.swipeDirection) return;

    const newVocabs = [...state.vocabularies];
    newVocabs[state.currentIndex].status = "REMEMBERED";
    dispatch({ type: "SET_VOCABULARIES", payload: newVocabs });

    dispatch({ type: "SET_SWIPE", payload: { direction: "right", previousIndex: state.currentIndex } });
    dispatch({ type: "TOGGLE_FLIP" });

    if (state.currentIndex < state.vocabularies.length - 1) {
      dispatch({ type: "SET_CURRENT_INDEX", payload: state.currentIndex + 1 });
      setTimeout(() => {
        dispatch({ type: "SET_SWIPE", payload: { direction: null, previousIndex: null } });
      }, 400);
    } else {
      setTimeout(() => {
        sessionCompletedRef.current = true;
        saveProgress(true);
      }, 400);
    }
  };

  const handleNotRemembered = () => {
    if (state.swipeDirection) return;

    const newVocabs = [...state.vocabularies];
    newVocabs[state.currentIndex].status = "NOT_REMEMBERED";
    dispatch({ type: "SET_VOCABULARIES", payload: newVocabs });

    dispatch({ type: "SET_SWIPE", payload: { direction: "left", previousIndex: state.currentIndex } });
    dispatch({ type: "TOGGLE_FLIP" });

    if (state.currentIndex < state.vocabularies.length - 1) {
      dispatch({ type: "SET_CURRENT_INDEX", payload: state.currentIndex + 1 });
      setTimeout(() => {
        dispatch({ type: "SET_SWIPE", payload: { direction: null, previousIndex: null } });
      }, 400);
    } else {
      setTimeout(() => {
        sessionCompletedRef.current = true;
        saveProgress(true);
      }, 400);
    }
  };

  const handleRestart = () => {
    dispatch({ type: "RESET" });
    sessionCompletedRef.current = false;
  };

  const toggleShowMode = () => {
    dispatch({ type: "TOGGLE_WORD_FIRST" });
    dispatch({ type: "TOGGLE_FLIP" });
  };

  const togglePronunciation = () => {
    dispatch({ type: "TOGGLE_PRONUNCIATION" });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (sessionCompletedRef.current) return;

      if (event.code === "Space") {
        event.preventDefault();
        dispatch({ type: "TOGGLE_FLIP" });
      }
      if (event.key === "ArrowRight") {
        handleNext();
      }
      if (event.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext, handlePrev]);

  return {
    state,
    dispatch,
    currentVocab,
    sessionCompletedRef,
    handleCardClick,
    handleNext,
    handlePrev,
    handleRemembered,
    handleNotRemembered,
    handleRestart,
    toggleShowMode,
    togglePronunciation,
    playAudio,
  };
};
