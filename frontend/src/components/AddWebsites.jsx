import { useState } from "react";
import api from "../lib/api.js";
import Card from "./ui/Card.jsx";
import Button from "./ui/Button.jsx";
import Input from "./ui/Input.jsx";

const LinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71" />
  </svg>
);

const AddWebsites = ({ onAdded }) => {
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e) => {
    e?.preventDefault?.();
    setError("");

    if (!/^https?:\/\//i.test(url)) {
      setError("URL must start with http:// or https://");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/websites/add", { url });
      setUrl("");
      if (onAdded) onAdded();
    } catch (err) {
      console.error("Error adding website:", err);
      setError(
        err?.response?.data?.error ||
          "Failed to add website. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-100">
          Add a website
        </h2>
        <p className="text-sm text-gray-400">
          Paste a full URL to start monitoring its status.
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start"
      >
        <Input
          icon={<LinkIcon />}
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={submitting}
          aria-label="Website URL"
        />
        <Button type="submit" disabled={submitting || !url}>
          {submitting ? "Adding..." : "Add Website"}
        </Button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </Card>
  );
};

export default AddWebsites;
