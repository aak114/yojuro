"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

const formSchema = z.object({
  name: z.string().min(3, { message: "Challenge name must be at least 3 characters." }),
  description: z.string().optional(),
  start_date: z.string().min(1, { message: "Start date is required." }),
  end_date: z.string().min(1, { message: "End date is required." }),
  entry_fee: z.preprocess((val) => Number(val), z.number().min(0, { message: "Entry fee must be a positive number." })),
})

export default function CreateChallengePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      entry_fee: 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {

    setLoading(true)
    setError(null)

    // Convert to proper datetime format (no timezone)
    const startDate = new Date(values.start_date).toISOString();
    const endDate = new Date(values.end_date).toISOString();

    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...values,
            start_date: startDate,
            end_date: endDate,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create challenge")
      }

      console.log("Challenge Created:", await response.json())
    } catch (err) {
      setError("Something went wrong.")
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-xl font-bold mb-4">Create a Challenge</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Challenge Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your challenge..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="start_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="end_date" render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="entry_fee" render={({ field }) => (
            <FormItem>
              <FormLabel>Entry Fee ($)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Challenge"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
