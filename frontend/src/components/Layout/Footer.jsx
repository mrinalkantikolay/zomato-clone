import { Link } from 'react-router-dom';
import { ChefHat, Github, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <ChefHat size={24} className="text-primary" />
              <span className="text-lg font-bold">
                Foodie<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed">
              Discover the best food & drinks from your favorite restaurants. Fast delivery, great taste.
            </p>
            <div className="flex gap-3 mt-4">
              {[Github, Twitter, Instagram, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="btn-icon w-9 h-9 rounded-lg bg-background"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {['Home', 'Restaurants', 'About Us', 'Contact'].map((link) => (
                <li key={link}>
                  <Link
                    to={link === 'Home' ? '/' : `/${link.toLowerCase().replace(' ', '-')}`}
                    className="text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wide">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {['Terms of Service', 'Privacy Policy', 'Refund Policy', 'Cookie Policy'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wide">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>support@foodiehub.com</li>
              <li>+91 98765 43210</li>
              <li>Kolkata, West Bengal</li>
              <li>India</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} FoodieHub. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Made with <span className="text-primary">♥</span> in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
