"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChatDetailPanel } from "../ChatComponents";

export default function ChatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftText = searchParams.get("text") ?? "";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const redirectToDesktopChat = () => {
      if (mediaQuery.matches) {
        const query = new URLSearchParams({ room: id });
        if (draftText) query.set("text", draftText);
        router.replace(`/admin/chat?${query.toString()}`);
      }
    };

    redirectToDesktopChat();
    mediaQuery.addEventListener("change", redirectToDesktopChat);

    return () => {
      mediaQuery.removeEventListener("change", redirectToDesktopChat);
    };
  }, [draftText, id, router]);

  return (
    <div className="h-screen w-full md:hidden">
      <ChatDetailPanel chatId={id} mode="page" onBack={() => router.push("/admin/chat")} />
    </div>
  );
}
