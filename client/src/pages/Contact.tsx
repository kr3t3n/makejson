import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Contact() {
  return (
    <div className="container py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert">
          <p>
            Have questions or suggestions? We'd love to hear from you. Here's how you can reach us:
          </p>
          
          <h2>Email</h2>
          <p>
            For general inquiries: <a href="mailto:contact@makejson.online">contact@makejson.online</a>
          </p>
          
          <h2>Social Media</h2>
          <p>
            Follow us for updates and announcements:
          </p>
          <ul>
            <li>
              <a href="https://twitter.com/makejsononline" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
            </li>
            <li>
              <a href="https://github.com/makejsononline" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
