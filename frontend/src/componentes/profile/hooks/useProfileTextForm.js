import { useCallback, useState } from "react";

const MAX_TAGS = 12;

export function useProfileTextForm({ initialIntro = "", initialDesc = "", initialTags = [] } = {}) {
  const [intro, setIntro] = useState(initialIntro);
  const [desc, setDesc] = useState(initialDesc);
  const [tags, setTags] = useState(initialTags);
  const [tagInput, setTagInput] = useState("");

  const formatTag = useCallback((value) => {
    const trimmed = (value || "").trim();
    if (!trimmed) return "";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }, []);

  const addTag = useCallback(() => {
    setTags((prevTags) => {
      if (prevTags.length >= MAX_TAGS) return prevTags;
      const formatted = formatTag(tagInput);
      if (!formatted) return prevTags;
      const exists = prevTags.some((tag) => (tag?.name || tag)?.toLowerCase() === formatted.toLowerCase());
      if (exists) return prevTags;
      return [...prevTags, { name: formatted, isInstrument: false }];
    });
    setTagInput("");
  }, [tagInput, formatTag]);

  const removeTag = useCallback((tagToRemove) => {
    const target = (tagToRemove?.name || tagToRemove || "").toLowerCase();
    setTags((prevTags) =>
      prevTags.filter((tag) => (tag?.name || tag || "").toLowerCase() !== target),
    );
  }, []);

  const handleTagInputKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addTag();
      }
    },
    [addTag],
  );

  const resetForm = useCallback(
    ({ intro: nextIntro, desc: nextDesc, tags: nextTags } = {}) => {
      setIntro(nextIntro ?? initialIntro);
      setDesc(nextDesc ?? initialDesc);
      setTags(Array.isArray(nextTags) ? nextTags : initialTags);
      setTagInput("");
    },
    [initialIntro, initialDesc, initialTags],
  );

  return {
    intro,
    desc,
    tags,
    tagInput,
    setIntro,
    setDesc,
    setTagInput,
    addTag,
    removeTag,
    handleTagInputKeyDown,
    resetForm,
    canAddTag: tags.length < MAX_TAGS,
    maxTags: MAX_TAGS,
  };
}

export default useProfileTextForm;
