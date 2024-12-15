import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="container py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert">
          <h2>1. Data Collection</h2>
          <p>
            We only collect the minimum amount of data necessary to provide our service. This includes:
          </p>
          <ul>
            <li>Files you upload for processing</li>
            <li>API keys you provide (stored securely in your browser's session storage)</li>
          </ul>

          <h2>2. Data Usage</h2>
          <p>
            Your files are processed in real-time and are not stored on our servers. API keys are only stored temporarily in your browser's session storage and are never transmitted to our servers.
          </p>

          <h2>3. Third-party Services</h2>
          <p>
            We use third-party AI services (OpenAI, Anthropic, Google) for processing your files. Please refer to their respective privacy policies for information about how they handle your data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
