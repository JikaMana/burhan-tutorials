(function () {
  "use strict";

  const selectedPlanName = document.getElementById("selected-plan-name");
  const selectedPlanTotal = document.getElementById("selected-plan-total");
  const selectedPackageLabel = document.getElementById(
    "selected-package-label",
  );
  const selectedPackageWaButton = document.getElementById(
    "selected-package-wa-button",
  );
  const selectedPackageCta = document.getElementById("selected-package-cta");
  const customPlanSection = document.getElementById("custom-plan-section");
  const customPlanPanel = document.getElementById("custom-plan-panel");
  const planWaButton = document.getElementById("plan-wa-button");
  const customTotal = document.getElementById("custom-total");
  const customWaButton = document.getElementById("custom-wa-button");
  const packageOptions = Array.prototype.slice.call(
    document.querySelectorAll(".package-option"),
  );
  const customCourses = Array.prototype.slice.call(
    document.querySelectorAll(".custom-course"),
  );

  const PLAN_MESSAGES = {
    bece: "Hello%20Burhan%20Tutors%2C%20I%20want%20to%20start%20with%20the%20BECE%20Booster%20package%20for%20%E2%82%A620%2C000%20monthly.",
    science:
      "Hello%20Burhan%20Tutors%2C%20I%20want%20to%20start%20with%20the%20Science%20Premium%20package%20for%20%E2%82%A628%2C000%20monthly.",
    custom:
      "Hello%20Burhan%20Tutors%2C%20I%20want%20to%20build%20a%20custom%20learning%20plan%20for%20my%20child.",
  };

  function formatMoney(value) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function updateSelectedPlan(button) {
    if (!button) return;

    const name = button.dataset.name || "Plan";
    const price = Number(button.dataset.price || 0);
    const isCustomPlan = button.dataset.plan === "custom";

    packageOptions.forEach(function (item) {
      item.classList.toggle("is-selected", item === button);
    });

    if (selectedPlanName) selectedPlanName.textContent = name;
    if (selectedPlanTotal) selectedPlanTotal.textContent = formatMoney(price);
    if (selectedPackageLabel) selectedPackageLabel.textContent = name;
    if (selectedPackageCta) selectedPackageCta.hidden = isCustomPlan;
    if (customPlanSection) {
      customPlanSection.classList.toggle("is-active", isCustomPlan);
    }

    const message = PLAN_MESSAGES[button.dataset.plan] || PLAN_MESSAGES.custom;
    const whatsappUrl = "https://wa.me/2348165689362?text=" + message;

    if (planWaButton) {
      planWaButton.href = whatsappUrl;
    }
    if (selectedPackageWaButton) {
      selectedPackageWaButton.href = whatsappUrl;
      selectedPackageWaButton.dataset.plan = button.dataset.plan || "custom";
      selectedPackageWaButton.dataset.planName = name;
      selectedPackageWaButton.dataset.planPrice = String(price);
    }

    if (isCustomPlan && customPlanSection) {
      const targetTop =
        customPlanSection.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: targetTop, behavior: "smooth" });
      window.setTimeout(function () {
        if (customPlanPanel) customPlanPanel.focus({ preventScroll: true });
      }, 450);
    }
  }

  function trackPackageClick(button) {
    if (
      !window.firebase ||
      !window.firebase.apps ||
      !window.firebase.apps.length
    ) {
      return;
    }

    window.firebase
      .firestore()
      .collection("package_whatsapp_clicks")
      .add({
        package: button.dataset.plan || "custom",
        packageName: button.dataset.planName || "Plan",
        price: Number(button.dataset.planPrice || 0),
        page: window.location.href,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      })
      .catch(function (error) {
        console.error("Package click tracking failed:", error);
      });
  }

  function updateCustomTotal() {
    let total = 0;
    const labels = [];

    customCourses.forEach(function (checkbox) {
      if (checkbox.checked) {
        total += Number(checkbox.value || 0);
        labels.push(checkbox.dataset.label);
      }
    });

    if (customTotal) customTotal.textContent = formatMoney(total);

    if (customWaButton) {
      if (!labels.length) {
        customWaButton.href =
          "https://wa.me/2348165689362?text=Hello%20Burhan%20Tutors%2C%20I%20want%20to%20build%20a%20custom%20learning%20plan%20for%20my%20child.";
        return;
      }

      const selectionText = labels.join(", ");
      customWaButton.href =
        "https://wa.me/2348165689362?text=" +
        encodeURIComponent(
          "Hello Burhan Tutors, I want a custom study plan for " +
            selectionText +
            " and the estimated total is " +
            formatMoney(total) +
            ".",
        );
    }
  }

  packageOptions.forEach(function (button) {
    button.addEventListener("click", function () {
      updateSelectedPlan(button);
    });
  });

  if (selectedPackageWaButton) {
    selectedPackageWaButton.addEventListener("click", function () {
      trackPackageClick(selectedPackageWaButton);
    });
  }

  customCourses.forEach(function (checkbox) {
    checkbox.addEventListener("change", updateCustomTotal);
  });

  const defaultPlan =
    packageOptions.find(function (button) {
      return button.dataset.plan === "science";
    }) || packageOptions[0];
  updateSelectedPlan(defaultPlan);
  updateCustomTotal();
})();
