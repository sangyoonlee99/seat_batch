"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function Hero() {
  const { signInWithGoogle } = useAuth();
  const [titleNumber, setTitleNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const titles = useMemo(
    () => ["effortless", "instant", "smart", "seamless", "perfect"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setTimeout(() => setLoading(false), 0);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-8 py-24 lg:py-40">

          <div>
            <Button variant="secondary" size="sm" className="gap-2 rounded-full px-4 text-gray-500">
              영어회화 자리배치 자동화 솔루션
            </Button>
          </div>

          <div className="flex flex-col items-center gap-5">
            <h1 className="max-w-3xl text-center text-5xl font-light tracking-tight text-gray-900 md:text-7xl">
              Seating made
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-gray-900"
                    initial={{ opacity: 0, y: -60 }}
                    transition={{ type: "spring", stiffness: 60, damping: 14 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -80 : 80, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="max-w-xl text-center text-lg leading-relaxed text-gray-500">
              영어회화 수업의 자리 배치를 자동으로 관리하세요.
              학생 레벨, 출석, 그룹 선호도를 고려한 최적의 자리를
              단 몇 초 만에 생성합니다.
            </p>
          </div>

          <div className="flex flex-row gap-3">
            <Button size="lg" variant="outline" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              데모 보기
            </Button>
            <Button size="lg" className="gap-2" onClick={handleSignIn} disabled={loading}>
              {loading ? '연결 중...' : 'Google로 시작하기'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}
