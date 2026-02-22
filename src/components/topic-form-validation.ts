/**
 * TopicForm validation logic and types.
 * @see specs/prd-web.md Section 4 (Editor Components)
 */

export interface TopicFormValues {
  title: string
  content: string
  category: string
  tags?: string[]
  crossPostBluesky?: boolean
  crossPostFrontpage?: boolean
}

export interface FormErrors {
  title?: string
  content?: string
  category?: string
}

export function validateTopicForm(values: TopicFormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.title.trim()) {
    errors.title = 'Title is required'
  } else if (values.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters'
  } else if (values.title.trim().length > 200) {
    errors.title = 'Title must be at most 200 characters'
  }
  if (!values.content.trim()) {
    errors.content = 'Content is required'
  } else if (values.content.trim().length < 10) {
    errors.content = 'Content must be at least 10 characters'
  }
  if (!values.category) {
    errors.category = 'Category is required'
  }
  return errors
}
