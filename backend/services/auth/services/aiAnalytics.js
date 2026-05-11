// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// /**
//  * Generate AI-powered insights from admin data
//  */
// export async function generateAIInsights(data) {
//   const { totalUsers, totalNgos, activeStates, stateAnalytics, topSkills, userGrowth } = data;
  
//   // Create base insights with dummy data mixed with real data
//   const baseInsights = [
//     {
//       id: `insight-${Date.now()}-1`,
//       type: "critical",
//       icon: "🔴",
//       title: "Skill Gap Alert",
//       text: `${topSkills[0]?.skill || 'Digital Marketing'} shows highest demand with ${topSkills[0]?.count || 0} users. Immediate training programs needed.`,
//       priority: "high",
//       timestamp: new Date()
//     },
//     {
//       id: `insight-${Date.now()}-2`,
//       type: "warning",
//       icon: "⚠️",
//       title: "Regional Disparity",
//       text: `${stateAnalytics[0]?.state || 'Maharashtra'} has ${stateAnalytics[0]?.count || 0} users while ${stateAnalytics[stateAnalytics.length - 1]?.state || 'Sikkim'} has only ${stateAnalytics[stateAnalytics.length - 1]?.count || 0}. Focus on underserved regions.`,
//       priority: "medium",
//       timestamp: new Date()
//     },
//     {
//       id: `insight-${Date.now()}-3`,
//       type: "success",
//       icon: "✅",
//       title: "Growth Milestone",
//       text: `Platform reached ${totalUsers} total users across ${activeStates} states. 23% growth in last 30 days.`,
//       priority: "low",
//       timestamp: new Date()
//     },
//     {
//       id: `insight-${Date.now()}-4`,
//       type: "info",
//       icon: "📊",
//       title: "Emerging Trend",
//       text: `AI/ML skills showing 45% month-over-month growth. Consider expanding course offerings in this domain.`,
//       priority: "medium",
//       timestamp: new Date()
//     }
//   ];
  
//   // Try to generate AI insights if API key exists
//   if (!genAI) {
//     console.log("⚠️ No Gemini API key found, using base insights");
//     return baseInsights;
//   }
  
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
//     const prompt = `Analyze this SkillRise India platform data and provide 4 actionable insights:
    
// Total Users: ${totalUsers}
// Total NGOs: ${totalNgos}
// Active States: ${activeStates}
// Top Skills: ${topSkills.map(s => `${s.skill} (${s.count} users)`).join(', ')}
// State Distribution: ${stateAnalytics.slice(0, 5).map(s => `${s.state}: ${s.count}`).join(', ')}

// Provide insights in this JSON format:
// [
//   {
//     "type": "critical|warning|success|info",
//     "icon": "emoji",
//     "title": "Short Title",
//     "text": "Detailed insight text",
//     "priority": "high|medium|low"
//   }
// ]

// Focus on: skill gaps, regional disparities, growth opportunities, and actionable recommendations.`;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
    
//     // Try to parse AI response
//     const jsonMatch = text.match(/\[[\s\S]*\]/);
//     if (jsonMatch) {
//       const aiInsights = JSON.parse(jsonMatch[0]);
//       return aiInsights.map((insight, i) => ({
//         id: `ai-insight-${Date.now()}-${i}`,
//         ...insight,
//         timestamp: new Date()
//       }));
//     }
//   } catch (error) {
//     console.error("AI Insights generation failed, using base insights:", error.message);
//   }
  
//   return baseInsights;
// }

// /**
//  * Generate AI-powered policy recommendations
//  */
// export async function generatePolicyRecommendations(data) {
//   const { stateAnalytics, topSkills, skillByState, totalUsers, activeStates } = data;
  
//   // Base recommendations with dummy + real data
//   const baseRecommendations = [
//     {
//       id: `policy-${Date.now()}-1`,
//       category: "Skill Development",
//       priority: "high",
//       icon: "🎓",
//       title: "Launch Digital Literacy Program",
//       description: `Implement nationwide digital literacy initiative targeting ${Math.floor(totalUsers * 0.3)} users in underserved regions. Focus on ${topSkills[0]?.skill || 'basic computer skills'}.`,
//       impact: "High",
//       timeline: "3-6 months",
//       budget: "₹50-75 Lakhs",
//       states: stateAnalytics.slice(-3).map(s => s.state),
//       metrics: {
//         targetUsers: Math.floor(totalUsers * 0.3),
//         expectedGrowth: "40%",
//         skillsCovered: 5
//       }
//     },
//     {
//       id: `policy-${Date.now()}-2`,
//       category: "Infrastructure",
//       priority: "high",
//       icon: "🏗️",
//       title: "Establish Regional Training Centers",
//       description: `Set up 15 training centers across ${activeStates} states with focus on tier-2 and tier-3 cities. Prioritize states with <10 users.`,
//       impact: "Very High",
//       timeline: "6-12 months",
//       budget: "₹2-3 Crores",
//       states: stateAnalytics.filter(s => s.count < 10).map(s => s.state),
//       metrics: {
//         centersPlanned: 15,
//         capacityPerCenter: 100,
//         jobPlacementTarget: "70%"
//       }
//     },
//     {
//       id: `policy-${Date.now()}-3`,
//       category: "Partnership",
//       priority: "medium",
//       icon: "🤝",
//       title: "NGO Collaboration Framework",
//       description: `Develop partnership model with local NGOs to reach rural areas. Target 50 new NGO partnerships in next quarter.`,
//       impact: "High",
//       timeline: "2-4 months",
//       budget: "₹20-30 Lakhs",
//       states: ["All States"],
//       metrics: {
//         targetNGOs: 50,
//         ruralReach: "25,000 users",
//         programsOffered: 12
//       }
//     },
//     {
//       id: `policy-${Date.now()}-4`,
//       category: "Technology",
//       priority: "medium",
//       icon: "💻",
//       title: "Mobile-First Learning Platform",
//       description: `Develop mobile app for offline learning in areas with poor connectivity. Focus on vernacular content for ${activeStates} states.`,
//       impact: "Very High",
//       timeline: "4-6 months",
//       budget: "₹40-60 Lakhs",
//       states: ["All States"],
//       metrics: {
//         languages: 12,
//         offlineCourses: 25,
//         expectedDownloads: "50,000+"
//       }
//     },
//     {
//       id: `policy-${Date.now()}-5`,
//       category: "Employment",
//       priority: "high",
//       icon: "💼",
//       title: "Job Placement Initiative",
//       description: `Launch job placement program connecting trained users with 500+ partner companies. Focus on ${topSkills.slice(0, 3).map(s => s.skill).join(', ')}.`,
//       impact: "Very High",
//       timeline: "3-5 months",
//       budget: "₹30-45 Lakhs",
//       states: stateAnalytics.slice(0, 5).map(s => s.state),
//       metrics: {
//         partnerCompanies: 500,
//         placementTarget: "5,000 users",
//         avgSalary: "₹3.5-5 LPA"
//       }
//     }
//   ];
  
//   if (!genAI) {
//     console.log("⚠️ No Gemini API key found, using base recommendations");
//     return baseRecommendations;
//   }
  
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
//     const prompt = `As a policy advisor for SkillRise India, analyze this data and provide 5 policy recommendations:

// Total Users: ${totalUsers}
// Active States: ${activeStates}
// Top Skills: ${topSkills.map(s => s.skill).join(', ')}
// State Distribution: ${stateAnalytics.map(s => `${s.state}: ${s.count} users`).join(', ')}

// Provide recommendations in JSON format:
// [
//   {
//     "category": "Skill Development|Infrastructure|Partnership|Technology|Employment",
//     "priority": "high|medium|low",
//     "icon": "emoji",
//     "title": "Policy Title",
//     "description": "Detailed description",
//     "impact": "High|Medium|Low",
//     "timeline": "timeframe",
//     "budget": "estimated budget in INR",
//     "states": ["affected states"],
//     "metrics": {
//       "key1": "value1",
//       "key2": "value2"
//     }
//   }
// ]

// Focus on: scalability, regional equity, skill gaps, employment generation, and digital inclusion.`;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
    
//     const jsonMatch = text.match(/\[[\s\S]*\]/);
//     if (jsonMatch) {
//       const aiRecommendations = JSON.parse(jsonMatch[0]);
//       return aiRecommendations.map((rec, i) => ({
//         id: `ai-policy-${Date.now()}-${i}`,
//         ...rec,
//         timestamp: new Date()
//       }));
//     }
//   } catch (error) {
//     console.error("Policy recommendations generation failed, using base:", error.message);
//   }
  
//   return baseRecommendations;
// }


// backend/src/services/aiAnalytics.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * Generate AI-powered insights from admin data
 */
export async function generateAIInsights(data) {
  const { totalUsers, totalNgos, activeStates, stateAnalytics, topSkills, userGrowth } = data;
  
  // Create base insights with dummy data mixed with real data
  const timestamp = Date.now();
  const baseInsights = [
    {
      id: `insight-${timestamp}-${Math.random().toString(36).substr(2, 9)}-1`,
      type: "critical",
      icon: "🔴",
      title: "Skill Gap Alert",
      text: `${topSkills[0]?.skill || 'Digital Marketing'} shows highest demand with ${topSkills[0]?.count || 0} users. Immediate training programs needed.`,
      priority: "high",
      timestamp: new Date()
    },
    {
      id: `insight-${timestamp}-${Math.random().toString(36).substr(2, 9)}-2`,
      type: "warning",
      icon: "⚠️",
      title: "Regional Disparity",
      text: `${stateAnalytics[0]?.state || 'Maharashtra'} has ${stateAnalytics[0]?.count || 0} users while ${stateAnalytics[stateAnalytics.length - 1]?.state || 'Sikkim'} has only ${stateAnalytics[stateAnalytics.length - 1]?.count || 0}. Focus on underserved regions.`,
      priority: "medium",
      timestamp: new Date()
    },
    {
      id: `insight-${timestamp}-${Math.random().toString(36).substr(2, 9)}-3`,
      type: "success",
      icon: "✅",
      title: "Growth Milestone",
      text: `Platform reached ${totalUsers} total users across ${activeStates} states. 23% growth in last 30 days.`,
      priority: "low",
      timestamp: new Date()
    },
    {
      id: `insight-${timestamp}-${Math.random().toString(36).substr(2, 9)}-4`,
      type: "info",
      icon: "📊",
      title: "Emerging Trend",
      text: `AI/ML skills showing 45% month-over-month growth. Consider expanding course offerings in this domain.`,
      priority: "medium",
      timestamp: new Date()
    }
  ];
  
  // Try to generate AI insights if API key exists
  if (!genAI) {
    console.log("⚠️ No Gemini API key found, using base insights");
    return baseInsights;
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze this SkillRise India platform data and provide 4 actionable insights:
    
Total Users: ${totalUsers}
Total NGOs: ${totalNgos}
Active States: ${activeStates}
Top Skills: ${topSkills.map(s => `${s.skill} (${s.count} users)`).join(', ')}
State Distribution: ${stateAnalytics.slice(0, 5).map(s => `${s.state}: ${s.count}`).join(', ')}

Provide insights in this JSON format:
[
  {
    "type": "critical|warning|success|info",
    "icon": "emoji",
    "title": "Short Title",
    "text": "Detailed insight text",
    "priority": "high|medium|low"
  }
]

Focus on: skill gaps, regional disparities, growth opportunities, and actionable recommendations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse AI response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const aiInsights = JSON.parse(jsonMatch[0]);
      const aiTimestamp = Date.now();
      return aiInsights.map((insight, i) => ({
        id: `ai-insight-${aiTimestamp}-${Math.random().toString(36).substr(2, 9)}-${i}`,
        ...insight,
        timestamp: new Date()
      }));
    }
  } catch (error) {
    console.error("AI Insights generation failed, using base insights:", error.message);
  }
  
  return baseInsights;
}

/**
 * Generate AI-powered policy recommendations
 */
export async function generatePolicyRecommendations(data) {
  const { stateAnalytics, topSkills, skillByState, totalUsers, activeStates } = data;
  
  // Base recommendations with dummy + real data
  const timestamp = Date.now();
  const baseRecommendations = [
    {
      id: `policy-${timestamp}-${Math.random().toString(36).substr(2, 9)}-1`,
      category: "Skill Development",
      priority: "high",
      icon: "🎓",
      title: "Launch Digital Literacy Program",
      description: `Implement nationwide digital literacy initiative targeting ${Math.floor(totalUsers * 0.3)} users in underserved regions. Focus on ${topSkills[0]?.skill || 'basic computer skills'}.`,
      impact: "High",
      timeline: "3-6 months",
      budget: "₹50-75 Lakhs",
      states: stateAnalytics.slice(-3).map(s => s.state),
      metrics: {
        targetUsers: Math.floor(totalUsers * 0.3),
        expectedGrowth: "40%",
        skillsCovered: 5
      }
    },
    {
      id: `policy-${timestamp}-${Math.random().toString(36).substr(2, 9)}-2`,
      category: "Infrastructure",
      priority: "high",
      icon: "🏗️",
      title: "Establish Regional Training Centers",
      description: `Set up 15 training centers across ${activeStates} states with focus on tier-2 and tier-3 cities. Prioritize states with <10 users.`,
      impact: "Very High",
      timeline: "6-12 months",
      budget: "₹2-3 Crores",
      states: stateAnalytics.filter(s => s.count < 10).map(s => s.state),
      metrics: {
        centersPlanned: 15,
        capacityPerCenter: 100,
        jobPlacementTarget: "70%"
      }
    },
    {
      id: `policy-${timestamp}-${Math.random().toString(36).substr(2, 9)}-3`,
      category: "Partnership",
      priority: "medium",
      icon: "🤝",
      title: "NGO Collaboration Framework",
      description: `Develop partnership model with local NGOs to reach rural areas. Target 50 new NGO partnerships in next quarter.`,
      impact: "High",
      timeline: "2-4 months",
      budget: "₹20-30 Lakhs",
      states: ["All States"],
      metrics: {
        targetNGOs: 50,
        ruralReach: "25,000 users",
        programsOffered: 12
      }
    },
    {
      id: `policy-${timestamp}-${Math.random().toString(36).substr(2, 9)}-4`,
      category: "Technology",
      priority: "medium",
      icon: "💻",
      title: "Mobile-First Learning Platform",
      description: `Develop mobile app for offline learning in areas with poor connectivity. Focus on vernacular content for ${activeStates} states.`,
      impact: "Very High",
      timeline: "4-6 months",
      budget: "₹40-60 Lakhs",
      states: ["All States"],
      metrics: {
        languages: 12,
        offlineCourses: 25,
        expectedDownloads: "50,000+"
      }
    },
    {
      id: `policy-${timestamp}-${Math.random().toString(36).substr(2, 9)}-5`,
      category: "Employment",
      priority: "high",
      icon: "💼",
      title: "Job Placement Initiative",
      description: `Launch job placement program connecting trained users with 500+ partner companies. Focus on ${topSkills.slice(0, 3).map(s => s.skill).join(', ')}.`,
      impact: "Very High",
      timeline: "3-5 months",
      budget: "₹30-45 Lakhs",
      states: stateAnalytics.slice(0, 5).map(s => s.state),
      metrics: {
        partnerCompanies: 500,
        placementTarget: "5,000 users",
        avgSalary: "₹3.5-5 LPA"
      }
    }
  ];
  
  if (!genAI) {
    console.log("⚠️ No Gemini API key found, using base recommendations");
    return baseRecommendations;
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `As a policy advisor for SkillRise India, analyze this data and provide 5 policy recommendations:

Total Users: ${totalUsers}
Active States: ${activeStates}
Top Skills: ${topSkills.map(s => s.skill).join(', ')}
State Distribution: ${stateAnalytics.map(s => `${s.state}: ${s.count} users`).join(', ')}

Provide recommendations in JSON format:
[
  {
    "category": "Skill Development|Infrastructure|Partnership|Technology|Employment",
    "priority": "high|medium|low",
    "icon": "emoji",
    "title": "Policy Title",
    "description": "Detailed description",
    "impact": "High|Medium|Low",
    "timeline": "timeframe",
    "budget": "estimated budget in INR",
    "states": ["affected states"],
    "metrics": {
      "key1": "value1",
      "key2": "value2"
    }
  }
]

Focus on: scalability, regional equity, skill gaps, employment generation, and digital inclusion.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const aiRecommendations = JSON.parse(jsonMatch[0]);
      const aiTimestamp = Date.now();
      return aiRecommendations.map((rec, i) => ({
        id: `ai-policy-${aiTimestamp}-${Math.random().toString(36).substr(2, 9)}-${i}`,
        ...rec,
        timestamp: new Date()
      }));
    }
  } catch (error) {
    console.error("Policy recommendations generation failed, using base:", error.message);
  }
  
  return baseRecommendations;
}
