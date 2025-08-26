"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { usePathname } from "next/navigation";

export default function PrivacyPolicyPage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  const { data, isLoading, error } = useQuery({
    queryKey: ["privacy-policy"],
    queryFn: async () => {
      const { data } = await axios.get("https://st.amjadshbib.com/api/privacy-policies");
      return data?.data;
    },
  });

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00B207]"></div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow">
          {locale === "ar" ? "فشل تحميل سياسة الخصوصية. يرجى المحاولة لاحقًا." : "Failed to load privacy policy. Please try again later."}
        </div>
      </main>
    );
  }

  const title = data.title?.[locale] || data.title?.en || "Privacy Policy";
  const content = data.content?.[locale] || data.content?.en || "";

  return (
    <main className="min-h-screen bg-[#faf8f5] py-10 px-4 flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-8 border border-[#e8e8e8]">
        <h1 className="text-3xl font-bold mb-6 text-[#00B207] text-center">{title}</h1>
        <div className="prose max-w-none text-gray-800 leading-7" dir={locale === "ar" ? "rtl" : "ltr"} style={{fontFamily: locale === "ar" ? 'Tajawal, sans-serif' : undefined}} dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </main>
  );
}
