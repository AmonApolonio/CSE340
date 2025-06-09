const pool = require("../database/")

class ReviewModel {
  async addReview(inv_id, account_id, review_text, rating) {
    try {
      const sql = `
        INSERT INTO public.reviews (inv_id, account_id, review_text, rating)
        VALUES ($1, $2, $3, $4)
        RETURNING *`;
      const data = await pool.query(sql, [inv_id, account_id, review_text, rating]);
      return data.rows[0];
    } catch (error) {
      console.error("addReview error: " + error);
      return { error: error.message };
    }
  }

  async getReviewsByVehicle(inv_id) {
    try {
      const sql = `
        SELECT r.*, a.account_firstname, a.account_lastname 
        FROM public.reviews r
        JOIN public.account a ON r.account_id = a.account_id
        WHERE r.inv_id = $1
        ORDER BY r.review_date DESC`;
      const data = await pool.query(sql, [inv_id]);
      return data.rows;
    } catch (error) {
      console.error("getReviewsByVehicle error: " + error);
      return { error: error.message };
    }
  }

  async getReviewsByAccount(account_id) {
    try {
      const sql = `
        SELECT r.*, i.inv_make, i.inv_model, i.inv_year
        FROM public.reviews r
        JOIN public.inventory i ON r.inv_id = i.inv_id
        WHERE r.account_id = $1
        ORDER BY r.review_date DESC`;
      const data = await pool.query(sql, [account_id]);
      return data.rows;
    } catch (error) {
      console.error("getReviewsByAccount error: " + error);
      return { error: error.message };
    }
  }

  async getReviewById(review_id) {
    try {
      const sql = `SELECT * FROM public.reviews WHERE review_id = $1`;
      const data = await pool.query(sql, [review_id]);
      return data.rows[0];
    } catch (error) {
      console.error("getReviewById error: " + error);
      return { error: error.message };
    }
  }

  async updateReview(review_id, review_text, rating) {
    try {
      const sql = `
        UPDATE public.reviews
        SET review_text = $1, rating = $2, review_date = CURRENT_TIMESTAMP
        WHERE review_id = $3
        RETURNING *`;
      const data = await pool.query(sql, [review_text, rating, review_id]);
      return data.rows[0];
    } catch (error) {
      console.error("updateReview error: " + error);
      return { error: error.message };
    }
  }

  async deleteReview(review_id) {
    try {
      const sql = `DELETE FROM public.reviews WHERE review_id = $1`;
      await pool.query(sql, [review_id]);
      return true;
    } catch (error) {
      console.error("deleteReview error: " + error);
      return { error: error.message };
    }
  }

  async checkExistingReview(inv_id, account_id) {
    try {
      const sql = `SELECT * FROM public.reviews WHERE inv_id = $1 AND account_id = $2`;
      const result = await pool.query(sql, [inv_id, account_id]);
      return result.rows[0];
    } catch (error) {
      console.error("checkExistingReview error: " + error);
      return { error: error.message };
    }
  }
}

module.exports = new ReviewModel();
