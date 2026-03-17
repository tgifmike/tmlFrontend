'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

export default function ContactForm() {

  const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const { data: session } = useSession();
    
    useEffect(() => {
			if (session?.user) {
				form.setValue('name', session.user.name || '');
				form.setValue('email', session.user.email || '');
			}
		}, [session]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      message: ""
    }
  });

  async function onSubmit(values: any) {

    setLoading(true);

    try {

      await fetch("http://localhost:8080/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: "admin@themanagerlife.com",
          subject: `Contact Form: ${values.name}`,
          message: `
Name: ${values.name}
Email: ${values.email}


Message:
${values.message}
`
        })
      });

      setSuccess(true);
      form.reset();

    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto">

      {success && (
        <p className="text-green-600 mb-6">
          Message sent successfully.
        </p>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >

          {/* Name */}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>

                <FormLabel>Name</FormLabel>

                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>

                <FormMessage />

              </FormItem>
            )}
          />

          {/* Email */}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>

                <FormLabel>Email</FormLabel>

                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    {...field}
                  />
                </FormControl>

                <FormMessage />

              </FormItem>
            )}
          />

          {/* Message */}

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>

                <FormLabel>Message</FormLabel>

                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder="Your message..."
                    {...field}
                  />
                </FormControl>

                <FormMessage />

              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>

        </form>
      </Form>

    </div>
  );
}