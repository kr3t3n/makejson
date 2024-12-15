import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="w-full py-4 px-4 mt-auto bg-card border-t">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap justify-center sm:justify-start gap-4">
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/contact"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Contact
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a
            href="https://www.buymeacoffee.com/makejson"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Like makejson.online? Buy us a ☕
          </a>
          <p className="text-sm text-muted-foreground">
            Created by{' '}
            <a
              href="https://makejson.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              makejson.online team
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
