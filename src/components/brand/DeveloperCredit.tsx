import { Github, Linkedin, Phone } from "lucide-react";

export function DeveloperCredit({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="tac-header mb-1 text-[8px] uppercase tracking-widest">Built &amp; Designed by</div>
      <div className="text-[12px] font-semibold tracking-wide text-foreground">Mohamed Nasser</div>
      <div className="mt-1.5 flex items-center gap-2">
        <a
          href="https://www.linkedin.com/in/mohamed-nasser-377b6b404"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary"
          aria-label="LinkedIn"
        >
          <Linkedin className="h-3.5 w-3.5" />
        </a>
        <a
          href="tel:+201010769288"
          className="text-muted-foreground hover:text-primary"
          aria-label="Phone / WhatsApp"
        >
          <Phone className="h-3.5 w-3.5" />
        </a>
        <a
          href="https://github.com/nohamednasser"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary"
          aria-label="GitHub"
        >
          <Github className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

export function DeveloperCreditBar({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Built &amp; Designed by</div>
          <div className="text-[13px] font-semibold text-foreground">Mohamed Nasser</div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://www.linkedin.com/in/mohamed-nasser-377b6b404"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary"
          >
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </a>
          <a
            href="tel:+201010769288"
            className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary"
          >
            <Phone className="h-3.5 w-3.5" /> 01010769288
          </a>
          <a
            href="https://github.com/nohamednasser"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary"
          >
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
