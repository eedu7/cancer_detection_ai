"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
    email: z.email(),
    password: z.string(),
});

type FormScheme = z.infer<typeof formSchema>;

export const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const form = useForm<FormScheme>({
        defaultValues: {
            email: "",
            password: "",
        },
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async ({ email, password }: FormScheme) => {
        await authClient.signIn.email(
            {
                email,
                password,
            },
            {
                onRequest: () => {
                    setLoading(true);
                },
                onSuccess: () => {
                    router.push("/dashboard");
                    setLoading(false);
                },
            },
        );
    };

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="max-w-lg w-full">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>
                        Sign in to access your dashboard.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form
                            className="space-y-8"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="name@example.com"
                                                {...field}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="********"
                                                {...field}
                                                type="password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                className="w-full text-md font-semibold"
                                disabled={loading}
                                type="submit"
                            >
                                {!loading ? (
                                    <>
                                        Sign in
                                        <ArrowRightIcon className="mr-2" />
                                    </>
                                ) : (
                                    <>
                                        Signing in...
                                        <Loader2Icon className="mr-2 animate-spin" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 items-center text-sm text-muted-foreground">
                    <div>
                        Don’t have an account?{" "}
                        <Link
                            className="text-primary underline hover:no-underline"
                            href="/register"
                        >
                            Create account
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            className="underline hover:no-underline"
                            href="/terms"
                        >
                            Terms & Conditions
                        </Link>
                        <span>•</span>
                        <Link
                            className="underline hover:no-underline"
                            href="/privacy"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};
