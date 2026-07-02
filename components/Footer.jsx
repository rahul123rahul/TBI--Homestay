import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCount = localStorage.getItem("tbi_visitor_cnt");
      const startCount = storedCount ? parseInt(storedCount, 10) : 1240;
      const newCount = startCount + 1;
      localStorage.setItem("tbi_visitor_cnt", newCount);
      setVisitorCount(newCount);
    }
  }, []);

  const footerLinks = {
    product: [
      { name: "Classifier Console", href: "/" },
      { name: "Dashboard Analytics", href: "/dashboard" },
      { name: "API Documentation", href: "#" },
    ],
    company: [
      { name: "Trishul Eco-Homestays", href: "https://trishulecohomestays.com", external: true },
      { name: "About Tool", href: "/about" },
      { name: "Privacy Policy", href: "#" },
    ],
    resources: [
      { name: "Sentiment Guide", href: "/about#guide" },
      { name: "Response Templates", href: "#" },
      { name: "Support Desk", href: "#" },
    ],
  };

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="h-4 w-4"
                >
                  <path d="M12 2L2 22h20L12 2z" />
                </svg>
              </div>
              <span className="text-md font-bold tracking-tight text-primary">
                Trishul<span className="text-accent font-medium text-sm">Classifier</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dedicated feedback classifier and response draft management tool for Trishul Eco-Homestays staff. Build connection, improve service, and maintain brand tone.
            </p>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-3 grid grid-cols-3 gap-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Console</h4>
              <ul className="mt-3 space-y-2 text-xs">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Resources</h4>
              <ul className="mt-3 space-y-2 text-xs">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Eco-Homestay</h4>
              <ul className="mt-3 space-y-2 text-xs">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} Trishul Eco-Homestays. All rights reserved. Staff Utility.
            </p>
            {visitorCount > 0 && (
              <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                👁️ Total Visits: {visitorCount}
              </span>
            )}
          </div>
          
          {/* Social Links */}
          <div className="flex space-x-4">
            <a
              href="https://github.com/rahul123rahul/TBI--Homestay"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              title="GitHub Repository"
            >
              <span className="sr-only">GitHub</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/rahul-lavudya-97a4a8267/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              title="LinkedIn Profile"
            >
              <span className="sr-only">LinkedIn</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
