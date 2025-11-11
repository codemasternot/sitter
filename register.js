import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("✅ JS Loaded: All Sitters register page initialized.");

const supabaseUrl = "https://fluhpvufuddebnyxglfq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsdWhwdnVmdWRkZWJueXhnbGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTcxNDgsImV4cCI6MjA3ODM3MzE0OH0.XlKT5hd1jUW62i0MK15Han2r_ClxVYikWVQ4q7r_JaI";
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const form = document.getElementById("register-form");
const roleSelect = document.getElementById("role");
const pcSection = document.getElementById("policeClearanceSection");
const pcInput = document.getElementById("policeClearance");

roleSelect.addEventListener("change", () => {
  console.log("🟡 Role changed to:", roleSelect.value);
  if (roleSelect.value === "sitter") {
    pcSection.classList.remove("hidden");
    pcInput.required = true;
  } else {
    pcSection.classList.add("hidden");
    pcInput.required = false;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("🟢 Form submitted!");

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const policeFile = document.getElementById("policeClearance").files[0];

  try {
    console.log("🟠 Attempting signup...");

    const { data: signupData, error: signupError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, role } }
    });

    if (signupError) throw signupError;

    const userId = signupData.user?.id;
    console.log("✅ Created user:", userId);

    if (role === "sitter" && policeFile) {
      const ext = policeFile.name.split(".").pop();
      const filePath = `${userId}/police-clearance.${ext}`;
      console.log("📤 Uploading file:", filePath);

      const { error: uploadError } = await supabaseClient.storage
        .from("police-clearance")
        .upload(filePath, policeFile, { upsert: true });

      if (uploadError) throw uploadError;

      console.log("✅ File uploaded successfully.");

      await supabaseClient.from("sitter_verification").insert({
        user_id: userId,
        file_path: filePath,
        status: "pending"
      });
    }

    alert("✅ Account created successfully!");
    window.location.href = "/login.html";

  } catch (err) {
    console.error("❌ Error:", err);
    alert("❌ " + err.message);
  }
});



