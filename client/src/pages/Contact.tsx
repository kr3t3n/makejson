import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// makejson.online runs with no backend, so there is no form to post to.
// Contact is a couple of honest links instead of a form that silently fails.
export default function Contact() {
  return (
    <div className="container max-w-2xl py-8 px-4">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>
            Questions, bugs or suggestions are all welcome.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            The quickest way to reach me is on X. Bug reports and feature requests
            are best filed as a GitHub issue, so they don't get lost.
          </p>

          <div className="flex flex-col gap-3">
            <a
              href="https://x.com/georgipep"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @georgipep on X
            </a>
            <a
              href="https://github.com/kr3t3n/makejson/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Open an issue on GitHub
            </a>
            <a
              href="https://buymeacoffee.com/georgipep"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Buy me a coffee ☕
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
