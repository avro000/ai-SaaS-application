import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Menu, X, LogOut, Clock, User, AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const navLinks = [
  { name: "Tools",        href: "/tools"        },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Pricing",      href: "/#pricing"      },
  { name: "FAQ",          href: "/#faq"          },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed z-50 transition-all duration-500 ${isScrolled ? "top-4 left-4 right-4" : "top-0 left-0 right-0"}`}>
      <nav className={`mx-auto transition-all duration-500 ${isScrolled || isMobileMenuOpen ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]" : "bg-transparent max-w-[1400px]"}`}>
        <div className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${isScrolled ? "h-14" : "h-20"}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className={`font-display tracking-tight transition-all duration-500 ${isScrolled ? "text-xl text-foreground" : "text-2xl text-white"}`}>NexusAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => {
              const isActive = (location.pathname + location.hash) === link.href || location.pathname === link.href;
              return (
                <a key={link.name} href={link.href} className={`text-sm transition-colors duration-300 relative group ${isActive ? (isScrolled ? "text-foreground" : "text-white") : (isScrolled ? "text-foreground/70 hover:text-foreground" : "text-white/70 hover:text-white")}`}>
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-px transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"} ${isScrolled ? "bg-foreground" : "bg-white"}`} />
                </a>
              );
            })}
          </div>

          {/* Desktop CTA or Profile */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <button onClick={() => navigate("/login", { state: { from: location.pathname + location.search } })} className={`transition-all duration-500 cursor-pointer ${isScrolled ? "text-xs text-foreground/70 hover:text-foreground" : "text-sm text-white/70 hover:text-white"}`}>
                  Sign in
                </button>
                <button onClick={() => navigate("/register", { state: { from: location.pathname + location.search } })} className={`rounded-full transition-all duration-500 cursor-pointer ${isScrolled ? "bg-foreground hover:bg-foreground/90 text-background px-4 h-8 text-xs" : "bg-white hover:bg-white/90 text-black px-6 py-2 text-sm"}`}>
                  Try Free
                </button>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-display text-sm transition-all duration-300 border cursor-pointer ${isScrolled ? "bg-foreground/5 border-foreground/10 text-foreground hover:border-foreground/30" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name || "User"} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-[#050706] border border-white/5 shadow-2xl rounded-[20px] p-2 flex flex-col gap-0.5 z-50">
                    <div className="px-3 py-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-white/50 font-mono truncate mt-0.5">{user.email}</p>
                    </div>
                    
                    <div className="h-px bg-white/5 mb-1 mx-2"></div>

                    <Link 
                      to="/history" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/90 hover:text-white hover:bg-foreground/[0.04] rounded-xl transition-colors cursor-pointer text-left font-medium"
                    >
                      <Clock className="w-4 h-4 text-white/50" />
                      History
                    </Link>

                    <Link 
                      to="/report" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/90 hover:text-white hover:bg-foreground/[0.04] rounded-xl transition-colors cursor-pointer text-left font-medium"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-400/80" />
                      Report an Issue
                    </Link>
                    
                    <div className="h-px bg-white/5 my-1 mx-2"></div>
                    
                    <button 
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logout();
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#ff6b6b] hover:text-[#ff8787] hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`md:hidden p-2 transition-colors duration-500 ${isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"}`} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 bg-background z-40 transition-all duration-500 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} style={{ top: 0 }}>
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link, i) => {
              const isActive = (location.pathname + location.hash) === link.href || location.pathname === link.href;
              return (
                <a key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`text-5xl font-display transition-all duration-500 ${isActive ? "text-[#eca8d6]" : "text-foreground hover:text-muted-foreground"} ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms" }}>
                  {link.name}
                </a>
              );
            })}
          </div>
          <div className={`flex flex-col gap-4 pt-8 border-t border-foreground/10 transition-all duration-500 ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}>
            {!user ? (
              <div className="flex gap-4">
                <button onClick={() => { setIsMobileMenuOpen(false); navigate("/login", { state: { from: location.pathname + location.search } }); }} className="flex-1 rounded-full h-14 text-base border border-foreground/20 text-foreground hover:bg-foreground/5 transition-colors">Sign in</button>
                <button onClick={() => { setIsMobileMenuOpen(false); navigate("/register", { state: { from: location.pathname + location.search } }); }} className="flex-1 bg-foreground text-background rounded-full h-14 text-base hover:bg-foreground/90 transition-colors">Try Free</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 px-2 py-4 border-b border-foreground/5">
                  <div className="w-12 h-12 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center text-xl font-display text-foreground overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name || "User"} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : user.name ? user.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-sm text-foreground/50 font-mono truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link 
                    to="/history" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-4 rounded-sm text-foreground hover:bg-foreground/5 transition-colors"
                  >
                    <Clock className="w-5 h-5 text-foreground/50" />
                    History
                  </Link>
                  <Link 
                    to="/report" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-4 rounded-sm text-foreground hover:bg-foreground/5 transition-colors"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-400/80" />
                    Report an Issue
                  </Link>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                      navigate("/");
                    }}
                    className="flex items-center gap-3 px-4 py-4 rounded-sm text-red-400 hover:bg-red-400/10 transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
