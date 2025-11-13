import React, { useState } from "react";
import axios from "axios";
import { Sparkles, Copy, Tag, Search, Zap, CheckCircle2 } from "lucide-react";

function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handletaggenerate = async () => {
    if (!title || !description) {
      return alert("Please fill in all fields");
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post("http://localhost:5000/api/user/tags", {
        title,
        description,
      });
      setResult(res.data);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.log(error);
      alert("Error generating tags");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.tags) return;
    const tagString = result.tags.join(", ");
    navigator.clipboard.writeText(tagString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4 sm:p-6">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-pink-600" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-linear-to-r from-pink-600 via-pink-500 to-pink-700 bg-clip-text text-transparent">
              TagGenie.ai
            </h1>
          </div>
          <p className="text-pink-700 text-base sm:text-lg font-medium">
            AI-Powered Product Tag Generator
          </p>
          <p className="text-pink-600 text-sm sm:text-base mt-2">
            Generate SEO-optimized tags in seconds
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Side - Input Form */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-pink-200/50 p-6 sm:p-8 border border-pink-100">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-pink-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-pink-900">
                Product Details
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-pink-800 mb-2">
                  <Search className="w-4 h-4" />
                  Product Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-2 border-pink-200 rounded-xl p-3 sm:p-4 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:outline-none transition-all duration-200 text-gray-800 placeholder-pink-300"
                  placeholder="e.g., Wireless Bluetooth Headphones"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-pink-800 mb-2">
                  <Zap className="w-4 h-4" />
                  Product Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border-2 border-pink-200 rounded-xl p-3 sm:p-4 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:outline-none transition-all duration-200 h-32 sm:h-40 resize-none text-gray-800 placeholder-pink-300"
                  placeholder="e.g., Premium noise-cancelling headphones with 30-hour battery life..."
                ></textarea>
              </div>

              <button
                type="button"
                onClick={handletaggenerate}
                disabled={loading}
                className="w-full bg-linear-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white disabled:from-pink-300 disabled:to-pink-400 font-bold rounded-xl py-3 sm:py-4 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-pink-300/50 flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Tags
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Side - Results */}
          <div className="bg-linear-to-br from-white to-pink-50 rounded-3xl shadow-2xl shadow-pink-200/50 p-6 sm:p-8 border border-pink-100">
            {result ? (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-pink-900">
                    Results
                  </h2>
                  <span className="text-xs sm:text-sm px-3 py-1 bg-pink-200 text-pink-800 rounded-full font-medium">
                    {result.source}
                  </span>
                </div>

                {/* Tags Section */}
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-pink-800 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags ({result.tags?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-linear-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Keywords Section */}
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-pink-800 mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    SEO Keywords ({result.keywords?.length || 0})
                  </h3>
                  <div className="space-y-2">
                    {result.keywords?.map((key, index) => (
                      <div
                        key={index}
                        className="bg-white border border-pink-200 rounded-lg px-4 py-2 text-pink-900 text-sm hover:border-pink-400 transition-colors duration-200"
                      >
                        <span className="text-pink-600 font-bold mr-2">
                          {index + 1}.
                        </span>
                        {key}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="w-full bg-white hover:bg-pink-50 text-pink-700 border-2 border-pink-300 hover:border-pink-500 px-4 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy All Tags
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="bg-pink-100 rounded-full p-6 mb-4">
                  <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-pink-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-pink-900 mb-2">
                  Ready to Generate!
                </h3>
                <p className="text-pink-700 text-sm sm:text-base max-w-sm">
                  Enter your product details and click generate to see
                  AI-powered tags and keywords
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-pink-600 text-xs sm:text-sm">
          <p>Made with ❤️ by Bagunas, Johnrey</p>
          <a
            href="https://github.com/BagunasJohnrey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-700 hover:text-pink-900 ml-1 underline"
          >
            GitHub
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Home;
