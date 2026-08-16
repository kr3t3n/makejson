import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="container py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert">
          <h2>1. What stays on your machine</h2>
          <p>
            makejson.online is a static page that runs in your browser. Files you drop in
            are read locally. Your AI API key is kept in session storage for this tab only
            and is sent straight to the provider you picked (OpenAI, Anthropic, or Google).
            We do not operate a server that receives your files or keys.
          </p>
          <h2>2. What we do not collect</h2>
          <p>
            We do not upload your documents to makejson.online. We do not store API keys.
            Closing the tab clears the key. There is no account and no analytics script.
          </p>
          <h2>3. Third-party providers</h2>
          <p>
            The provider you choose sees the extracted text and the key you supply. Their
            privacy policies apply to that request. makejson.online is operated by Mangia Studios Limited.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
