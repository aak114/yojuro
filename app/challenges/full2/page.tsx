"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Fetch exercises from DB
const fetchExercises = async () => {
  const res = await fetch("/api/exercises");
  if (!res.ok) throw new Error("Failed to load exercises");
  return res.json();
};

// Validation schema
const formSchema = z.object({
  name: z.string().min(3, "Challenge name must be at least 3 characters."),
  description: z.string().optional(),
  start_date: z.string().min(1, "Start date is required."),
  end_date: z.string().min(1, "End date is required."),
  entry_fee: z.coerce.number().min(0, "Entry fee must be positive."),
  sequences: z.array(
    z.object({
      duration: z.coerce.number().min(1, "Duration must be at least 1 second."),
      workouts: z.array(
        z.object({
          exercise_id: z.string().min(1, "Exercise is required."),
          reps: z.coerce.number().min(1, "Reps must be at least 1."),
          workout_order: z.coerce.number().int().min(1)
        })
      ),
    })
  ),
});

type FormData = z.infer<typeof formSchema>;

export default function MultiStepChallengeForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<{ id: string; name: string }[]>([]);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      name: "", 
      description: "", 
      start_date: "", 
      end_date: "", 
      entry_fee: 0, 
      sequences: [{ 
        duration: 60, // Default 60 seconds
        workouts: [] 
      }]
    },
  });

  // Create field array for sequences
  const { fields: sequences, append: appendSequence, remove: removeSequence } = useFieldArray({
    control: form.control,
    name: "sequences",
  });

  useEffect(() => {
    fetchExercises().then(setExercises).catch(console.error);
  }, []);

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      console.log("Submitting form with values:", values);
      
      // Step 1: Create Challenge
      const challengeRes = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          start_date: values.start_date,
          end_date: values.end_date,
          entry_fee: values.entry_fee,
          status: "draft",
        }),
      });

      if (!challengeRes.ok) throw new Error("Failed to create challenge");

      const { challenge_id } = await challengeRes.json();

      // Step 2: Create Sequences & Workouts
      for (const sequence of values.sequences) {
        const sequenceRes = await fetch("/api/sequences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            challenge_id, 
            duration: sequence.duration 
          }),
        });

        if (!sequenceRes.ok) throw new Error("Failed to create sequence");

        const { sequence_id } = await sequenceRes.json();

        // Step 3: Create Workouts
        if (sequence.workouts && sequence.workouts.length > 0) {
          for (const workout of sequence.workouts) {
            await fetch("/api/workouts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                sequence_id, 
                exercise_id: workout.exercise_id, 
                reps: workout.reps,
                workout_order: workout.workout_order,
              }),
            });
          }
        }
      }

      alert("Challenge created successfully!");
      form.reset();
      setStep(1);
    } catch (error) {
      console.error(error);
      alert("Failed to create challenge. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-xl font-bold mb-4">Create a Challenge</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <>
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="start_date" render={({ field }) => (
                <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="end_date" render={({ field }) => (
                <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="entry_fee" render={({ field }) => (
                <FormItem><FormLabel>Entry Fee ($)</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="button" onClick={() => setStep(2)}>Next</Button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold">Sequences</h2>
              
              {sequences.map((sequenceField, sequenceIndex) => (
                <div key={sequenceField.id} className="border p-4 rounded-md space-y-4 mb-4">
                  <FormField 
                    control={form.control} 
                    name={`sequences.${sequenceIndex}.duration`} 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 60)} 
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <h3 className="text-md font-medium">Workouts</h3>
                    
                    <WorkoutsFieldArray 
                      control={form.control} 
                      sequenceIndex={sequenceIndex} 
                      exercises={exercises} 
                    />
                  </div>
                  
                  {sequences.length > 1 && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={() => removeSequence(sequenceIndex)}
                    >
                      Remove Sequence
                    </Button>
                  )}
                </div>
              ))}
              
              <Button 
                type="button"
                variant="outline"
                onClick={() => appendSequence({ 
                  duration: 60, 
                  workouts: [] 
                })}
              >
                Add Sequence
              </Button>
              
              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Submit Challenge"}
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  );
}

function WorkoutsFieldArray({ 
  control, 
  sequenceIndex, 
  exercises 
}: { 
  control: any; 
  sequenceIndex: number; 
  exercises: { id: string; name: string }[];
}) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `sequences.${sequenceIndex}.workouts`,
  });

  const addWorkout = () => {
    append({ 
      exercise_id: "", 
      reps: 1, 
      workout_order: fields.length + 1 
    });
  };

  const moveWorkout = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < fields.length) {
      move(index, newIndex);
      
      // Update workout_order for all workouts
      const allWorkouts = control._formValues.sequences[sequenceIndex].workouts;
      allWorkouts.forEach((_, idx: number) => {
        control.setValue(
          `sequences.${sequenceIndex}.workouts.${idx}.workout_order`, 
          idx + 1
        );
      });
    }
  };

  return (
    <div>
      {fields.length === 0 && (
        <p className="text-sm text-gray-500 italic">No workouts added yet.</p>
      )}
      
      {fields.map((field, workoutIndex) => (
        <div key={field.id} className="border p-3 rounded-md space-y-2 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Workout #{workoutIndex + 1}</span>
            <div className="flex space-x-1">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                disabled={workoutIndex === 0}
                onClick={() => moveWorkout(workoutIndex, 'up')}
              >
                ↑
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                disabled={workoutIndex === fields.length - 1}
                onClick={() => moveWorkout(workoutIndex, 'down')}
              >
                ↓
              </Button>
            </div>
          </div>

          {/* Hidden field for workout_order */}
          <FormField
            control={control}
            name={`sequences.${sequenceIndex}.workouts.${workoutIndex}.workout_order`}
            defaultValue={workoutIndex + 1}
            render={({ field }) => (
              <Input type="hidden" {...field} />
            )}
          />
          
          <FormField 
            control={control} 
            name={`sequences.${sequenceIndex}.workouts.${workoutIndex}.exercise_id`} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exercise</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val)}>
    <FormControl>
        <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an exercise" />
        </SelectTrigger>
    </FormControl>
    <SelectContent>
        {exercises.map((ex) => (
        <SelectItem key={ex.id} value={ex.id}>
            {ex.name}
        </SelectItem>
        ))}
    </SelectContent>
                    </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField 
            control={control} 
            name={`sequences.${sequenceIndex}.workouts.${workoutIndex}.reps`} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reps</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="button" 
            variant="destructive" 
            size="sm"
            onClick={() => remove(workoutIndex)}
          >
            Remove Workout
          </Button>
        </div>
      ))}
      
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        onClick={addWorkout}
      >
        Add Workout
      </Button>
    </div>
  );
}