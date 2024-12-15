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
            For general inquiries: <a href="mailto:hello@makejson.online">hello@makejson.online</a>
          </p>
          
          <h2>Social Media</h2>
          <p>
            Follow us for updates and announcements:
          </p>
          <ul>
            <li>
              <a href="https://x.com/georgipep" target="_blank" rel="noopener noreferrer">
                X
              </a>
            </li>
            <li>
              <a href="https://github.com/kr3t3n" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
