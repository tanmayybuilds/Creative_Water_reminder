"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "@/components/PageContainer";
import { Logo } from "@/components/Logo";
import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import { useExitChallenge } from "@/features/exit-challenge/hooks/useExitChallenge";
import { ExitProgressBar } from "@/features/exit-challenge/components/ExitProgressBar";
import { ExitStageIntro } from "@/features/exit-challenge/components/ExitStageIntro";
import { ExitStageAdmit } from "@/features/exit-challenge/components/ExitStageAdmit";
import { ExitStageQuestion } from "@/features/exit-challenge/components/ExitStageQuestion";
import { ExitStageMoneyFame } from "@/features/exit-challenge/components/ExitStageMoneyFame";
import { ExitStageConfirmation } from "@/features/exit-challenge/components/ExitStageConfirmation";
import { ExitStageCompleted } from "@/features/exit-challenge/components/ExitStageCompleted";
import { ArrowLeft } from "lucide-react";

export default function ExitPage() {
  const router = useRouter();
  const {
    isLoaded,
    hasActiveSession,
    stage,
    question,
    selectedOptionId,
    moneyOrFame,
    moneyFameReaction,
    abandonedRecord,
    goToStage,
    selectAnswer,
    selectMoneyOrFameChoice,
    returnToFocus,
    confirmExit,
  } = useExitChallenge();

  if (!isLoaded) {
    return (
      <PageContainer centered>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  // Fallback: No active session to exit
  if (!hasActiveSession && stage !== "completed") {
    return (
      <PageContainer centered>
        <div className="flex flex-col items-center justify-center text-center max-w-md px-4 py-16 select-none">
          <AnimatedWrapper delay={0.1}>
            <Logo size="sm" className="mb-6" />
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.2}>
            <p className="text-lg text-zinc-300 font-medium mb-2">
              There\u2019s no active session to exit.
            </p>
            <p className="text-sm text-zinc-500 mb-8">
              Start a new focus session to commit and lock in.
            </p>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.3}>
            <motion.button
              onClick={() => router.push("/")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm tracking-wider uppercase hover:bg-zinc-200 transition-colors cursor-pointer shadow-lg shadow-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK HOME
            </motion.button>
          </AnimatedWrapper>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer centered>
      <div className="flex flex-col items-center justify-center w-full max-w-xl px-4 py-8 sm:py-12 select-none">
        {/* Progress Bar for stages */}
        <ExitProgressBar stage={stage} />

        {/* Stage Views */}
        <AnimatePresence mode="wait">
          {stage === "intro" && (
            <ExitStageIntro
              key="intro"
              onContinue={() => goToStage("admit")}
            />
          )}

          {stage === "admit" && (
            <ExitStageAdmit
              key="admit"
              onConfirmQuit={() => goToStage("question")}
              onTakeMeBack={returnToFocus}
            />
          )}

          {stage === "question" && question && (
            <ExitStageQuestion
              key="question"
              question={question}
              selectedOptionId={selectedOptionId}
              onAnswerSelected={selectAnswer}
              onContinue={() => goToStage("money_fame")}
            />
          )}

          {stage === "money_fame" && (
            <ExitStageMoneyFame
              key="money_fame"
              selectedChoice={moneyOrFame}
              savedReaction={moneyFameReaction}
              onChoiceSelected={selectMoneyOrFameChoice}
              onContinue={() => goToStage("final_confirmation")}
            />
          )}

          {stage === "final_confirmation" && (
            <ExitStageConfirmation
              key="final_confirmation"
              onKeepFocusing={returnToFocus}
              onConfirmExit={confirmExit}
            />
          )}

          {stage === "completed" && abandonedRecord && (
            <ExitStageCompleted
              key="completed"
              sessionRecord={abandonedRecord}
              onViewSession={() => router.push("/result")}
            />
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
