// src/hooks/use-toast.ts
// This file implements a custom toast notification system, inspired by react-hot-toast.
// It provides a `useToast` hook for components to dispatch and manage toasts,
// and a `toast` function for imperative toast dispatching from anywhere.
// The actual rendering of toasts is handled by the `<Toaster />` component.

"use client" // This hook manages client-side state and interacts with React context.

import * as React from "react"

import type {
  ToastActionElement, // Type for the optional action button in a toast
  ToastProps,         // Props for the underlying Toast component from ShadCN
} from "@/components/ui/toast"

const TOAST_LIMIT = 1 // Maximum number of toasts visible at a time
const TOAST_REMOVE_DELAY = 1000000 // A very long delay; effectively means toasts are removed by dismissal or limit

// Extends ToastProps with an ID and optional ReactNode content
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// Action types for the toast reducer
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST", // Action to remove a toast from the list entirely
} as const

let count = 0 // Counter for generating unique toast IDs

// Generates a unique ID for each toast
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

// Defines the possible actions for the toast reducer
type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast> // For updating existing toasts
    }
  | {
      type: ActionType["DISMISS_TOAST"] // Marks a toast as not 'open', starts removal queue
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"] // Removes a toast from the state
      toastId?: ToasterToast["id"]
    }

// Defines the shape of the toast state
interface State {
  toasts: ToasterToast[]
}

// Map to store timeouts for removing toasts after dismissal
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Adds a toast to a queue for removal after a delay
// This allows for exit animations before the toast is removed from the DOM.
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return // Already in queue
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    // Dispatch REMOVE_TOAST action after delay
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY) // Using a very long delay as removal is mainly driven by limit or explicit dismiss

  toastTimeouts.set(toastId, timeout)
}

// Reducer function to manage toast state based on dispatched actions
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Adds a new toast to the beginning of the array and limits the total number of toasts
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      // Updates an existing toast by its ID
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action
      // If a specific toastId is provided, add it to the removal queue.
      // Otherwise, add all current toasts to the removal queue (e.g., dismiss all).
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }
      // Sets the 'open' state of the target toast(s) to false.
      // The Toaster component uses this 'open' state for enter/exit animations.
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST": 
      // Removes a toast from the state entirely.
      // If no toastId is provided, it clears all toasts.
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state; // Return current state if action type is unknown
  }
}

// Set of listener functions that will be called when the toast state changes
const listeners = new Set<(state: State) => void>()

// In-memory state for toasts. This allows dispatching toasts from outside React components.
let memoryState: State = { toasts: [] }

// Dispatch function: updates memoryState and notifies all listeners
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Type for the `toast` function's props (omits 'id' as it's generated internally)
type Toast = Omit<ToasterToast, "id">

/**
 * Function to dispatch a new toast.
 * @param props - Properties of the toast to display (title, description, variant, etc.).
 * @returns An object with `id`, `dismiss`, and `update` functions for the created toast.
 */
function toast({ ...props }: Toast) {
  const id = genId() // Generate a unique ID for the toast

  // Function to update this specific toast
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  // Function to dismiss this specific toast
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  // Add the new toast to the state
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true, // New toasts are initially open
      onOpenChange: (open) => { // Callback for when ShadCN Toast's open state changes (e.g., swipe to dismiss)
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * `useToast` hook.
 * Provides access to the current toast state and functions to dispatch or dismiss toasts.
 * @returns An object with the current `toasts` array, the `toast` function, and a `dismiss` function.
 */
function useToast() {
  // Local React state, kept in sync with the global `memoryState` via listeners
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    // Subscribe to changes in the global toast state
    listeners.add(setState)
    // Unsubscribe on component unmount
    return () => {
      listeners.delete(setState)
    }
  }, [state]) // Effect dependency ensures correct subscription management

  return {
    ...state, // Current toasts: { toasts: ToasterToast[] }
    toast,    // Function to create a new toast
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }), // Function to dismiss toast(s)
  }
}

export { useToast, toast }
