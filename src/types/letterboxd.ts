export type LetterboxdReview = {
  id: string
  filmTitle: string
  filmYear: number | null
  posterUrl: string | null
  rating: number | null
  liked: boolean
  // The review as plain text, and the member credited for it
  review: string | null
  reviewer: string | null
  diaryDate: string | null
  url: string
}
