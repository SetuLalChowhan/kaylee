import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import FooterText from "@/assets/images/footerText.png";

const Footer = () => {
  const navLinks = [
    { name: "Features", path: "#features" },
    { name: "How it Works", path: "#workflow" },
    { name: "Pricing", path: "#pricing" },
    { name: "Customer", path: "#testimonials" },
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, path: "#" },
    { icon: <Twitter className="w-5 h-5" />, path: "#" },
    { icon: <Instagram className="w-5 h-5" />, path: "#" },
  ];

  return (
    <footer className="bg-Primary text-white overflow-hidden pt-12 lg:pt-20">
      <div className="section-padding">
        {/* Top Row: Links & Socials */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          <ul className="flex items-center gap-6 lg:gap-10">
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.path}
                  className="text-sm lg:text-base font-medium opacity-90 hover:opacity-100 transition-opacity"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <Link
                key={index}
                to={social.path}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
              >
                {social.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-white/10 w-full mb-10" />

        {/* Copyright */}
        <div className="text-center mb-10">
          <p className="text-sm lg:text-base opacity-70 font-medium tracking-wide">
            © 2025 STAKD. All rights reserved.
          </p>
        </div>
      </div>

      {/* Large Bottom Image */}
      <div className="relative w-full section-padding">
        <img
          src={FooterText}
          alt="STAKD"
          className="w-full h-auto object-contain select-none pointer-events-none"
        />
      </div>
    </footer>
  );
};

export default Footer;