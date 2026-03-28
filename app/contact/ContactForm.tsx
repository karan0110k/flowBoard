"use client";

import { useState } from "react";
import { Mail, Clock, MessageSquare, Github, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ContactForm({ userName, userEmail }: { userName: string; userEmail: string }) {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [subject, setSubject] = useState("General Question");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }
    if (!message.trim()) { setError("Please enter a message."); return; }

    // Store in localStorage as a simple record
    const submissions = JSON.parse(localStorage.getItem("flowboard_contact_submissions") || "[]");
    submissions.push({ name: name.trim(), email: email.trim(), subject, message: message.trim(), date: new Date().toISOString() });
    localStorage.setItem("flowboard_contact_submissions", JSON.stringify(submissions));

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
        <p className="text-gray-400 mb-6">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
        <button
          onClick={() => { setSubmitted(false); setMessage(""); }}
          className="bg-[#0c66e4] hover:bg-[#0a5bc7] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Contact Support</h1>
        <p className="text-gray-400 text-lg">Have a question or feedback? We&apos;d love to hear from you.</p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-[#282e33] rounded-2xl p-6 border border-white/[0.08] text-center">
          <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
            <Mail className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">Email</h3>
          <p className="text-gray-400 text-xs">support@flowboard.com</p>
        </div>
        <div className="bg-[#282e33] rounded-2xl p-6 border border-white/[0.08] text-center">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <Clock className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">Response Time</h3>
          <p className="text-gray-400 text-xs">We typically respond within 24 hours</p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-[#282e33] rounded-2xl p-6 border border-white/[0.08] mb-10">
        <h2 className="text-lg font-bold text-white mb-5">Send us a message</h2>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-xl mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full h-10 bg-[#22272b] border border-white/10 rounded-lg px-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full h-10 bg-[#22272b] border border-white/10 rounded-lg px-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-10 bg-[#22272b] border border-white/10 rounded-lg px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/60 appearance-none"
            >
              <option>General Question</option>
              <option>Bug Report</option>
              <option>Feature Request</option>
              <option>Account Issue</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Message</label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your question or issue in detail..."
              className="w-full bg-[#22272b] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60 resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full h-10 bg-[#0c66e4] hover:bg-[#0a5bc7] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Additional Links */}
      <div className="flex flex-wrap justify-center gap-4 text-center pb-8">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
          <Github className="h-4 w-4" /> GitHub
        </a>
        <Link href="/help" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
          <MessageSquare className="h-4 w-4" /> Help Center
        </Link>
      </div>
    </div>
  );
}
