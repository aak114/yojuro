"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Workout } from "@/types/workouts" // Import the Workout type

type WorkoutFormValues = {
  workouts: Workout[];
};

export default function WorkoutsForm({ challengeId }: { challengeId: string | null }) {
  const [loading, setLoading] = useState(false)

  const form = useForm<WorkoutFormValues>({
    defaultValues: {
      workouts: [{ exerciseType: "", reps: 0, duration: 0, challenge_id: challengeId || "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "workouts",
  })

  const handleSubmit = async (values: WorkoutFormValues) => {
    setLoading(true)
    try {
      // Send multiple workouts in the request body
      const response = await fetch(`/api/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workouts: values.workouts.map(workout => ({
            ...workout,
            challenge_id: challengeId, // Ensure challenge_id is added
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create workouts")
      }
      console.log("Workouts Created:", await response.json())
    } catch (error) {
      console.error("Error creating workouts:", error)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-xl font-bold mb-4">Add Workouts to Challenge</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4">
              <FormField control={form.control} name={`workouts[${index}].exerciseType`} render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Type</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={field.value.exerciseType}
                      onChange={(e) => field.onChange({ ...field.value, exerciseType: e.target.value })}
                      placeholder="e.g., Push-ups"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name={`workouts[${index}].reps`} render={({ field }) => (
                <FormItem>
                  <FormLabel>Reps</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value.reps}
                      onChange={(e) => field.onChange({ ...field.value, reps: Number(e.target.value) })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name={`workouts[${index}].duration`} render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (seconds)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value.duration}
                      onChange={(e) => field.onChange({ ...field.value, duration: Number(e.target.value) })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="button" variant="outline" onClick={() => remove(index)}>
                Remove Workout
              </Button>
            </div>
          ))}

          <Button type="button" onClick={() => append({ exerciseType: "", reps: 0, duration: 0, challenge_id: challengeId || "" })}>
            Add Another Workout
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Workouts"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
