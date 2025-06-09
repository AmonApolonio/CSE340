-- Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    review_id SERIAL PRIMARY KEY,
    inv_id INTEGER NOT NULL REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE,
    review_text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_review_per_vehicle UNIQUE (inv_id, account_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_inv_id ON public.reviews(inv_id);
CREATE INDEX IF NOT EXISTS idx_reviews_account_id ON public.reviews(account_id);
