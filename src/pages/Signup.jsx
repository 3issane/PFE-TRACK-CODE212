import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:8080";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("name") || "").trim();
    const lastName = String(formData.get("lastname") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const repeatPassword = String(formData.get("repeatPassword") || "");
    if (password !== repeatPassword) {
      setLoading(false);
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Echec de l'inscription (${res.status})`);
      }
      navigate("/login");
    } catch (err) {
      setError(err?.message || "Echec de l'inscription");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Créer un compte</h2>
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
          <input type="text" id="name" name="name" required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800" />
        </div>
        <div>
          <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">Nom de famille</label>
          <input type="text" id="lastname" name="lastname" required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" id="email" name="email" required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input type="password" id="password" name="password" required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800" />
        </div>
        <div>
          <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-700 mb-1">Répéter le mot de passe</label>
          <input type="password" id="repeatPassword" name="repeatPassword" required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800" />
        </div>
  <Button type="submit" className="w-full" disabled={loading}>{loading ? "Inscription..." : "S'inscrire"}</Button>
        <div className="text-center text-sm mt-2">
          <a href="/login" className="text-gray-800 hover:underline">Déjà inscrit ? Se connecter</a>
        </div>
      </form>
    </div>
  );
};

export default Signup;
