document.addEventListener("DOMContentLoaded", () => {
  /* ===============================
     Safety checks
     =============================== */
  if (typeof Chart === "undefined") {
    console.error("[SYSTEMIC] Chart.js not loaded");
    return;
  }

  if (!window["chartjs-plugin-annotation"]) {
    console.error("[SYSTEMIC] Annotation plugin not loaded");
    return;
  }

  Chart.register(window["chartjs-plugin-annotation"]);

  const canvas = document.getElementById("rightsErosionChart");
  const table = document.querySelector(".gnostic-table");

  if (!canvas || !table) {
    console.warn("[SYSTEMIC] Chart canvas or table not found");
    return;
  }

  /* ===============================
     Theme tokens
     =============================== */
  const styles = getComputedStyle(document.body);

  const accent =
    styles.getPropertyValue("--text-accent").trim() || "#c9a44c";
  const strongText =
    styles.getPropertyValue("--strong-text").trim() || "#eaeaea";
  const shadowGlow =
    styles.getPropertyValue("--shadow-glow").trim() ||
    "rgba(255,255,255,0.15)";

  /* ===============================
     Extract table → timeline data
     =============================== */
  const rows = Array.from(table.querySelectorAll("tbody tr"));

  const data = [];
  const annotations = {};

  rows.forEach((row, index) => {
    const yearCell = row.querySelector("td[data-year]");
    const meaningCell = row.querySelectorAll("td")[2];

    if (!yearCell || !meaningCell) return;

    const yearNum = Number(yearCell.dataset.year);
    const value = index + 1;

    // Push real x/y point
    data.push({ x: yearNum, y: value });

    // Break annotation text into readable lines
    const textLines = meaningCell.textContent
      .trim()
      .split(" ")
      .reduce((lines, word) => {
        const last = lines[lines.length - 1];
        if (!last || last.length > 22) {
          lines.push(word);
        } else {
          lines[lines.length - 1] += " " + word;
        }
        return lines;
      }, []);

    const isRightSide = yearNum >= 2016;
    const xShift = isRightSide ? -70 : 70;
    const yShift = index % 2 === 0 ? -32 : 32;

    /* Connector line */
    annotations[`line-${index}`] = {
      type: "line",
      xMin: yearNum,
      xMax: yearNum,
      yMin: value,
      yMax: value,
      borderColor: "rgba(255,255,255,0.25)",
      borderWidth: 1,
      drawTime: "afterDatasetsDraw",
      xAdjust: xShift,
      yAdjust: yShift
    };

    /* Label box */
    annotations[`label-${index}`] = {
      type: "label",
      xValue: yearNum,
      yValue: value,
      xAdjust: xShift,
      yAdjust: yShift,
      content: textLines,
      backgroundColor: "rgba(0,0,0,0.55)",
      color: strongText,
      padding: 6,
      borderRadius: 4,
      font: {
        size: window.innerWidth < 600 ? 8 : 10,
        family: "inherit"
      },
      textAlign: isRightSide ? "end" : "start"
    };
  });

  /* ===============================
     Build chart
     =============================== */
  new Chart(canvas.getContext("2d"), {
    type: "line",

    data: {
      datasets: [
        {
          label: "Cumulative Restrictive Laws",
          data,
          parsing: false,
          borderColor: accent,
          backgroundColor: accent + "66",
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: accent,
          tension: 0.25
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        title: {
          display: true,
          text: "Timeline of Rights Erosion in the UK (1986–2025)",
          color: strongText,
          font: { size: window.innerWidth < 600 ? 11 : 14 }
        },
        legend: {
          labels: {
            color: strongText,
            font: { size: window.innerWidth < 600 ? 9 : 11 }
          }
        },
        annotation: {
          annotations
        }
      },

      scales: {
        /* REAL timeline */
        x: {
          type: "linear",
          min: 1985,
          max: 2026,

          title: {
            display: true,
            text: "Year",
            color: strongText
          },

          grid: { color: shadowGlow },

          ticks: {
            color: strongText,
            stepSize: 5,
            callback: v => v.toString()
          }
        },

        y: {
          min: 0,
          max: 14,

          beginAtZero: true,
          display: window.innerWidth >= 600,

          title: {
            display: window.innerWidth >= 600,
            text: "Cumulative Restrictive Laws",
            color: strongText
          },

          grid: {
            display: window.innerWidth >= 600,
            color: shadowGlow
          },

          ticks: {
            display: window.innerWidth >= 600,
            color: strongText,
            stepSize: 2
          }
        }
      }
    }
  });
});
