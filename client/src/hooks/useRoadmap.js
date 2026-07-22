import { useState, useEffect } from "react";
import { generateRoadmap, updateRoadmap, careerSwitchRoadmap, saveRoadmapRecord } from "../services/roadmapApi";

export const useRoadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastPayload, setLastPayload] = useState(null);

  useEffect(() => {
    const savedRoadmap = localStorage.getItem("roadmap");
    if (savedRoadmap) {
      try {
        setRoadmap(JSON.parse(savedRoadmap));
      } catch (err) {
        console.error("Failed to parse saved roadmap:", err);
      }
    }
  }, []);

  // Save roadmap to localStorage whenever it changes
  useEffect(() => {
    if (roadmap && roadmap.length > 0) {
      localStorage.setItem("roadmap", JSON.stringify(roadmap));
    }
  }, [roadmap]);

  const generate = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setRoadmap(null);
      
      console.log("🚀 Starting roadmap generation...");
      const res = await generateRoadmap(data);
      
      if (res.error) {
        console.error("❌ Error from backend:", res.message);
        setError(res.message);
        setRoadmap([]);
        return res;
      }
      
      console.log("✅ Roadmap received:", res.roadmap?.length, "items");
      const nextRoadmap = res?.roadmap ?? res ?? [];
      setRoadmap(nextRoadmap);
      setLastPayload({
        type: "generate",
        roadmap: nextRoadmap,
        targetRole: data?.targetRole || data?.profile?.targetRole || "",
        duration: data?.duration || "",
        completedSteps: data?.completedSteps || [],
        summary: res?.summary || "",
        profileData: data?.profile || {},
        rawResponse: res,
        metadata: {
          generatedAt: new Date().toISOString(),
          source: "generate",
        },
      });

      return res;
      
    } catch (err) {
      console.error("❌ Roadmap generation failed:", err);
      const errorMessage = err.message || "Failed to generate roadmap";
      setError(errorMessage);
      setRoadmap([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Updating roadmap...");
      const res = await updateRoadmap(formData);
      
      if (res.error) {
        console.error("❌ Error from backend:", res.message);
        setError(res.message);
        return res;
      }
      
      console.log("✅ Roadmap updated:", res.roadmap?.length, "items");
      const nextRoadmap = res?.roadmap ?? res ?? [];
      setRoadmap(nextRoadmap);
      setLastPayload({
        type: "update",
        roadmap: nextRoadmap,
        targetRole: formData?.get?.("targetRole") || "",
        duration: formData?.get?.("duration") || "",
        completedSteps: formData?.get?.("completedSteps") ? JSON.parse(formData.get("completedSteps") || "[]") : [],
        summary: res?.summary || "",
        profileData: {},
        rawResponse: res,
        metadata: {
          generatedAt: new Date().toISOString(),
          source: "update",
        },
      });
      return res;
      
    } catch (err) {
      console.error("❌ Roadmap update failed:", err);
      const errorMessage = err.message || "Failed to update roadmap";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const careerSwitchGenerate = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      setRoadmap(null);
      
      console.log("🔀 Generating career switch roadmap...");
      const res = await careerSwitchRoadmap(formData);
      
      if (res.error) {
        console.error("❌ Error from backend:", res.message);
        setError(res.message);
        setRoadmap([]);
        return res;
      }
      
      console.log("✅ Career switch roadmap received:", res.roadmap?.length, "items");
      const nextRoadmap = res?.roadmap ?? res ?? [];
      setRoadmap(nextRoadmap);
      setLastPayload({
        type: "career-switch",
        roadmap: nextRoadmap,
        targetRole: formData?.get?.("targetRole") || "",
        duration: formData?.get?.("duration") || "",
        completedSteps: [],
        summary: res?.summary || "",
        profileData: {},
        rawResponse: res,
        metadata: {
          generatedAt: new Date().toISOString(),
          source: "career-switch",
        },
      });
      return res;
      
    } catch (err) {
      console.error("❌ Career switch generation failed:", err);
      const errorMessage = err.message || "Failed to generate career switch roadmap";
      setError(errorMessage);
      setRoadmap([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const clearRoadmap = () => {
    setRoadmap(null);
    setLastPayload(null);
    localStorage.removeItem("roadmap");
  };

  const saveCurrentRoadmap = async () => {
    if (!roadmap || roadmap.length === 0) {
      return { success: false, message: "No roadmap to save" };
    }

    try {
      const payload = {
        ...(lastPayload || { type: "generate", metadata: { generatedAt: new Date().toISOString(), source: "generate" } }),
        roadmap,
      };

      const result = await saveRoadmapRecord(payload);
      return result;
    } catch (err) {
      console.error("Failed to save roadmap:", err);
      throw err;
    }
  };

  return { roadmap, generate, update, careerSwitchGenerate, saveCurrentRoadmap, error, loading, clearRoadmap};
};
