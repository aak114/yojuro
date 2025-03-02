"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
 // Use SelectItem instead of Option

// Define validation schema
const formSchema = z.object({
  challenge: z.object({
    name: z.string().min(3, { message: "Challenge name must be at least 3 characters." }),
    description: z.string().optional(),
    start_date: z.string().min(1, { message: "Start date is required." }),
    end_date: z.string().min(1, { message: "End date is required." }),
    entry_fee: z.preprocess((val) => Number(val), z.number().min(0, { message: "Entry fee must be a positive number." })),
  }),
  sequences: z.array(
    z.object({
      sequence_id: z.string().optional(),
      sequence_dates: z.array(z.string().min(1)).optional(),
      duration: z.number().optional(),
      workouts: z.array(
        z.object({
          exercise_type: z.string(),
          reps: z.number().min(1),
          workout_order: z.number(),
        })
      ),
    })
  ),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateChallengePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      challenge: {
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        entry_fee: 0,
      },
      sequences: [],
    },
  });

  // Add sequence handler
  const addSequence = () => {
    form.setValue("sequences", [
      ...form.getValues().sequences,
      { workouts: [], sequence_dates: [] },
    ]);
  };

  // Remove sequence handler
  const removeSequence = (index: number) => {
    const newSequences = [...form.getValues().sequences];
    newSequences.splice(index, 1);
    form.setValue("sequences", newSequences);
  };

  // Add workout to sequence
  const addWorkout = (sequenceIndex: number) => {
    const newSequences = [...form.getValues().sequences];
    newSequences[sequenceIndex].workouts.push({
      exercise_type: "",
      reps: 0,
      workout_order: newSequences[sequenceIndex].workouts.length + 1,
    });
    form.setValue("sequences", newSequences);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    // Step 1: Create Challenge
    try {
      const challengeResponse = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.challenge),
      });

      if (!challengeResponse.ok) {
        throw new Error("Failed to create challenge");
      }

      const challengeData = await challengeResponse.json();
      const challengeId = challengeData.challenge_id; // Get challenge_id

      // Step 2: Create Sequences
      for (const sequence of data.sequences) {
        const sequenceResponse = await fetch("/api/sequences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...sequence, challenge_id: challengeId }),
        });

        if (!sequenceResponse.ok) {
          throw new Error("Failed to create sequence");
        }

        const sequenceData = await sequenceResponse.json();
        const sequenceId = sequenceData.sequence_id; // Get sequence_id

        // Step 3: Create Workouts
        for (const workout of sequence.workouts) {
          await fetch("/api/workouts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...workout, sequence_id: sequenceId }),
          });
        }
      }

      console.log("Challenge, sequences, and workouts created successfully");
    } catch (error) {
      setError("Something went wrong.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-xl font-bold mb-4">Create a Challenge</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Challenge Info */}
          <FormField control={form.control} name="challenge.name" render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Challenge Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="challenge.description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your challenge..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="challenge.start_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="challenge.end_date" render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="challenge.entry_fee" render={({ field }) => (
            <FormItem>
              <FormLabel>Entry Fee ($)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Sequences Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Sequences</h2>
            {form.getValues().sequences.map((_, index) => (
              <div key={index} className="border p-4 rounded-md">
                <h3>Sequence {index + 1}</h3>

                <FormField control={form.control} name={`sequences.${index}.sequence_dates`} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sequence Dates</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder="Comma separated dates" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name={`sequences.${index}.duration`} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Workouts for the sequence */}
                <div className="space-y-4">
                  <h4>Workouts</h4>
                  {form.getValues().sequences[index].workouts.map((workout, workoutIndex) => (
                    <div key={workoutIndex} className="border p-4 rounded-md">
                      <FormField control={form.control} name={`sequences.${index}.workouts.${workoutIndex}.exercise_type`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exercise</FormLabel>
                          <FormControl>
                            <Select {...field}>
                              <SelectItem value="pushup">Pushup</SelectItem>
                              <SelectItem value="squat">Squat</SelectItem>
                              {/* Add other exercises here */}
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name={`sequences.${index}.workouts.${workoutIndex}.reps`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reps</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name={`sequences.${index}.workouts.${workoutIndex}.workout_order`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workout Order</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  ))}

                  <Button onClick={() => addWorkout(index)}>Add Workout</Button>
                </div>

                <Button onClick={() => removeSequence(index)} className="mt-4" variant="destructive">
                  Remove Sequence
                </Button>
              </div>
            ))}
            <Button onClick={addSequence}>Add Sequence</Button>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Challenge"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
