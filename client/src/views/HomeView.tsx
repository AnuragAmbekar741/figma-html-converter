import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getUserInfo } from "../api/figma-oauth";
import { motion } from "framer-motion";
import { ArrowRight, Figma, LogOut, Loader2 } from "lucide-react";
import { extractFileKeyFromUrl, isValidFigmaUrl } from "../utils/figma-url";
import { getFigmaFile } from "../api/figma-file";
import { AxiosError } from "axios";

const HomeView: React.FC = () => {
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error: authError,
  } = useQuery({
    queryKey: ["figma", "user"],
    queryFn: getUserInfo,
    retry: false,
  });

  const fileMutation = useMutation({
    mutationFn: (fileKey: string) => getFigmaFile(fileKey),
    onSuccess: (data) => {
      console.log("File data received:", data);
      setError(null);
      // Handle the file data here (e.g., display it, convert it, etc.)
    },
    onError: (error: unknown) => {
      console.error("Error fetching file:", error);
      const axiosError = error as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error ||
          axiosError.message ||
          "Failed to fetch file. Please check the URL and try again."
      );
    },
  });

  const handleLogout = async () => {
    // Logout logic can be added here if needed
    window.location.href = "/";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate URL
    if (!isValidFigmaUrl(fileUrl)) {
      setError("Please enter a valid Figma file URL");
      return;
    }

    // Extract file key
    const fileKey = extractFileKeyFromUrl(fileUrl);
    if (!fileKey) {
      setError(
        "Could not extract file key from URL. Please check the URL format."
      );
      return;
    }

    // Call API
    fileMutation.mutate(fileKey);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#FAFAF9] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError || !data?.success) return null;

  const user = data.user;

  return (
    <div className="relative min-h-screen w-full bg-[#FAFAF9] text-stone-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-hidden">
      {/* --- Background Gradients --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] bg-orange-100/50 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] bg-rose-100/40 rounded-full blur-[120px]" />
      </div>

      {/* --- Top Left Profile Card --- */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 left-6 z-20"
      >
        <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-md border border-stone-400 p-2 pr-4 rounded-full shadow-sm hover:shadow-md transition-shadow">
          {user.img_url ? (
            <img
              src={user.img_url}
              alt={user.handle}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-xs font-bold text-stone-500">
              {user.handle.charAt(0)}
            </div>
          )}
          <div className="text-sm">
            <p className="font-medium text-stone-900 leading-tight">
              {user.handle}
            </p>
            <p className="text-[10px] text-stone-500 leading-tight">
              {user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* --- Main Content --- */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-6 pt-48">
        <div className="w-full max-w-2xl text-center space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 border border-stone-200 text-xs font-medium text-stone-500 uppercase tracking-widest mb-6">
              Converter
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-stone-900 mb-4">
              Import your <span className="text-orange-600">Design</span>
            </h1>
            <p className="text-lg text-stone-500 max-w-lg mx-auto">
              Paste your Figma file link below to start converting your design
              into clean HTML code.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="w-full max-w-xl mx-auto space-y-4"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-rose-200 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative flex items-center bg-white rounded-full border border-stone-200 shadow-sm focus-within:shadow-md focus-within:border-orange-200 transition-all duration-300 p-2 pl-6">
                <Figma className="w-5 h-5 text-stone-400 flex-shrink-0 mr-3" />
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => {
                    setFileUrl(e.target.value);
                    setError(null);
                  }}
                  placeholder="https://www.figma.com/file/..."
                  className="flex-1 bg-transparent border-none outline-none text-stone-900 placeholder:text-stone-300 text-base"
                  required
                  disabled={fileMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={fileMutation.isPending}
                  className="ml-2 bg-stone-900 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-stone-800 transition-colors flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {fileMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Convert</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3"
              >
                {error}
              </motion.div>
            )}

            {fileMutation.isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3"
              >
                File loaded successfully! File name:{" "}
                {fileMutation.data?.file?.name}
              </motion.div>
            )}
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
