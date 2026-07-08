import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Globe } from 'lucide-react';
import FooterText from "@/assets/images/footerText.png";
import useClient from "@/hooks/useClient";

const Footer = () => {
  const { data: cmsData } = useClient({
    queryKey: ["publicCms"],
    url: "/cms",
    isPrivate: false,
  });

  const cms = cmsData?.data || {};

  const navLinks = [
    { name: "Features", path: "#features" },
    { name: "How it Works", path: "#workflow" },
    { name: "Pricing", path: "#pricing" },
    { name: "Customer", path: "#testimonials" },
  ];

  const socialLinks = [];
  if (cms.social_facebook) {
    socialLinks.push({ icon: <Facebook className="w-5 h-5" />, path: cms.social_facebook });
  }
  if (cms.social_twitter) {
    socialLinks.push({ icon: <Twitter className="w-5 h-5" />, path: cms.social_twitter });
  }
  if (cms.social_instagram) {
    socialLinks.push({ icon: <Instagram className="w-5 h-5" />, path: cms.social_instagram });
  }
  if (cms.social_youtube) {
    socialLinks.push({ icon: <Youtube className="w-5 h-5" />, path: cms.social_youtube });
  }
  if (cms.social_linkedin) {
    socialLinks.push({ icon: <Linkedin className="w-5 h-5" />, path: cms.social_linkedin });
  }
  if (cms.social_website) {
    socialLinks.push({ icon: <Globe className="w-5 h-5" />, path: cms.social_website });
  }

  // Fallback to default if no links configured in CMS
  if (socialLinks.length === 0) {
    socialLinks.push(
      { icon: <Facebook className="w-5 h-5" />, path: "#" },
      { icon: <Twitter className="w-5 h-5" />, path: "#" },
      { icon: <Instagram className="w-5 h-5" />, path: "#" }
    );
  }

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
              <a
                key={index}
                href={social.path}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-white/10 w-full mb-10" />

        {/* Copyright & Legal Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 text-center md:text-left">
          <p className="text-sm lg:text-base opacity-70 font-medium tracking-wide">
            {cms.footer_copyright || "© 2025 STAKD. All rights reserved."}
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link
              to="/acceptable-use-policy"
              className="text-sm opacity-70 hover:opacity-100 transition-opacity font-medium"
            >
              Acceptable Use Policy
            </Link>
            <Link
              to="/cookie-policy"
              className="text-sm opacity-70 hover:opacity-100 transition-opacity font-medium"
            >
              Cookie Policy
            </Link>
            <Link
              to="/privacy-policy"
              className="text-sm opacity-70 hover:opacity-100 transition-opacity font-medium"
            >
              Privacy Policy
            </Link>
            <Link
              to="/subscription-billing-policy"
              className="text-sm opacity-70 hover:opacity-100 transition-opacity font-medium"
            >
              Subscription & Billing Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Large Bottom Image or Custom Brand Title Watermark */}
      <div className="relative w-full section-padding text-center overflow-hidden">
        {cms.system_logo_text && cms.system_logo_text.toUpperCase() !== "STAKD" ? (
          <h2 className="text-[12vw] font-black text-white/5 uppercase tracking-widest leading-none select-none pointer-events-none mb-6">
            {cms.system_logo_text}
          </h2>
        ) : (
          <img src={FooterText}
            alt="STAKD"
            className="w-full h-auto object-contain select-none pointer-events-none"
          loading="lazy" />
        )}
      </div>
    </footer>
  );
};

export default Footer;