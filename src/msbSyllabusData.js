// Official Maharashtra State Board (MSBSHSE / Balbharati) Master Syllabus, Textbook Extracts, Solutions & PYQs
export const MSB_CURRICULUM = {
  '10': {
    'Science & Technology 1': [
      {
        ch: 1,
        title: 'Gravitation',
        weightage: '5 Marks',
        bridgeConcept: 'Prerequisite for Class 11 Gravitation & Circular Motion',
        topics: ['Kepler Laws of Planetary Motion', 'Newton Universal Law of Gravitation', 'Acceleration due to Gravity (g)', 'Free Fall & Escape Velocity'],
        textbookContent: `
### 1. Gravitation & Centripetal Force
The phenomenon of gravitation was discovered by Sir Isaac Newton. The force of attraction between any two objects in the universe is called gravitational force.

**Centripetal Force:** A force acts on any object moving along a circle and it is directed towards the center of the circle. This is called Centripetal force.

### 2. Kepler's Laws
1. **First Law:** The orbit of a planet is an ellipse with the Sun at one of the foci.
2. **Second Law:** The line joining the planet and the Sun sweeps equal areas in equal intervals of time.
3. **Third Law:** The square of its period of revolution around the Sun is directly proportional to the cube of the mean distance of a planet from the Sun ($T^2 \\propto r^3$).

### 3. Newton's Universal Law of Gravitation
Every object in the Universe attracts every other object with a definite force which is directly proportional to the product of the masses of the two objects and inversely proportional to the square of the distance between them.
$$F = G \\frac{m_1 m_2}{d^2}$$
where $G = 6.673 \\times 10^{-11} \\text{ N m}^2/\\text{kg}^2$.
        `,
        solutions: [
          {
            q: "Q1. Write Kepler's Three Laws of Planetary Motion.",
            ans: "1. First Law: The orbit of a planet is an ellipse with the Sun at one of the foci.\n2. Second Law: The line joining the planet and the Sun sweeps equal areas in equal intervals of time.\n3. Third Law: The square of its period of revolution around the Sun is directly proportional to the cube of the mean distance of the planet from the Sun (T² ∝ r³)."
          },
          {
            q: "Q2. Define Acceleration due to Gravity (g) and write its SI unit and value on Earth's surface.",
            ans: "The gravitational force exerted by the Earth on an object produces an acceleration in it. This is called acceleration due to gravity (g).\n• Value on Earth's surface: g = 9.8 m/s².\n• SI Unit: m/s²."
          },
          {
            q: "Q3. Calculate the gravitational force between two objects of mass 50 kg and 120 kg separated by 2 meters.",
            ans: "Formula: F = G * (m1 * m2) / r²\nF = (6.673 × 10⁻¹¹) × (50 × 120) / (2)²\nF = (6.673 × 10⁻¹¹) × 6000 / 4\nF = 1.00095 × 10⁻⁷ N."
          }
        ]
      },
      {
        ch: 2,
        title: 'Periodic Classification of Elements',
        weightage: '5 Marks',
        topics: ['Doberainer Triads', 'Newlands Law of Octaves', 'Mendeleev Periodic Table', 'Modern Periodic Law'],
        textbookContent: `
### Periodic Classification Trends
• **Doberainer's Triads:** Arranged elements in groups of three with similar chemical properties. The atomic mass of the middle element was approximately equal to the mean of the atomic masses of the other two.
• **Modern Periodic Law:** Properties of elements are a periodic function of their atomic numbers.
• **Periodic Trends:** Atomic radius decreases across a period from left to right and increases down a group.
        `,
        solutions: [
          {
            q: "Q1. State the Modern Periodic Law.",
            ans: "Properties of elements are a periodic function of their atomic numbers."
          },
          {
            q: "Q2. Why does atomic radius decrease across a period?",
            ans: "As we move left to right across a period, electrons are added to the same shell while nuclear charge increases. This pulls the valence electrons closer to the nucleus, reducing atomic radius."
          }
        ]
      }
    ],
    'Mathematics (Algebra)': [
      {
        ch: 1,
        title: 'Linear Equations in Two Variables',
        weightage: '12 Marks',
        topics: ['Simultaneous Equations', 'Graphical Method', 'Cramer Rule (Determinant Method)'],
        textbookContent: `
### Linear Equations in Two Variables
An equation which contains two variables and the degree of each term containing variables is one is called a linear equation in two variables.
General form: $ax + by + c = 0$ (where $a, b \\neq 0$).

### Cramer's Rule
$$D = \\begin{vmatrix} a_1 & b_1 \\\\ a_2 & b_2 \\end{vmatrix} = a_1 b_2 - a_2 b_1$$
$$x = \\frac{D_x}{D}, \\quad y = \\frac{D_y}{D}$$
        `,
        solutions: [
          {
            q: "Q1. Solve using Cramer's Rule: 3x - 4y = 10, 4x + 3y = 5.",
            ans: "D = |3 -4; 4 3| = 3(3) - (-4)(4) = 9 + 16 = 25.\nDx = |10 -4; 5 3| = 10(3) - (-4)(5) = 30 + 20 = 50.\nDy = |3 10; 4 5| = 3(5) - 10(4) = 15 - 40 = -25.\nx = Dx / D = 50 / 25 = 2.\ny = Dy / D = -25 / 25 = -1.\nAnswer: x = 2, y = -1."
          }
        ]
      }
    ]
  },
  '12': {
    'Physics': [
      {
        ch: 1,
        title: 'Rotational Dynamics',
        weightage: '7 Marks',
        bridgeConcept: 'Requires Class 11 Circular Motion & Laws of Motion',
        topics: ['Uniform Circular Motion', 'Centripetal & Centrifugal Force', 'Moment of Inertia', 'Radius of Gyration', 'Law of Conservation of Angular Momentum'],
        textbookContent: `
### 1. Circular Motion & Kinematics
Circular motion is the motion of an object along the circumference of a circle.
• **Centripetal Force:** $F_c = \\frac{m v^2}{r} = m \\omega^2 r$.
• **Vehicle on a Circular Level Road:** Maximum safe speed $v_{max} = \\sqrt{\\mu_s r g}$.
• **Banking of Roads:** Angle of banking $\\theta = \\tan^{-1}\\left(\\frac{v^2}{r g}\\right)$.

### 2. Moment of Inertia (I)
The rotational inertia of a rigid body about a given axis of rotation is $I = \\sum m_i r_i^2 = \\int r^2 dm$.
• **Radius of Gyration (K):** $I = M K^2 \\implies K = \\sqrt{\\frac{I}{M}}$.
        `,
        solutions: [
          {
            q: "Q1. Obtain an expression for the maximum safety speed with which a vehicle can safely negotiate a curved unbanked road.",
            ans: "When a vehicle negotiates a curved level road, centripetal force is provided by static friction between tires and road.\nFc = fs(max) => m(v² / r) = μs * m * g\nv² = μs * r * g\nv(max) = √(μs * r * g)."
          },
          {
            q: "Q2. State Theorem of Parallel Axes and Theorem of Perpendicular Axes.",
            ans: "1. Theorem of Parallel Axes: Io = Ic + M(h²), where Io is Moment of Inertia about any axis, Ic is MI about parallel axis through center of mass, M is total mass, and h is distance between axes.\n2. Theorem of Perpendicular Axes: Iz = Ix + Iy for a flat planar lamina in xy-plane."
          }
        ]
      },
      {
        ch: 2,
        title: 'Mechanical Properties of Fluids',
        weightage: '7 Marks',
        topics: ['Fluid Pressure & Pascal Law', 'Surface Tension & Angle of Contact', 'Viscosity & Terminal Velocity', 'Bernoulli Principle'],
        textbookContent: `
### Surface Tension & Pressure Differences
Surface tension ($T$) is defined as force per unit length acting perpendicular to an imaginary line drawn on the free surface of a liquid ($T = F / L$).
Excess pressure inside a liquid drop: $\\Delta P = \\frac{2T}{r}$.
Excess pressure inside a soap bubble: $\\Delta P = \\frac{4T}{r}$.
        `,
        solutions: [
          {
            q: "Q1. Calculate the work done in blowing a soap bubble of radius 5 cm if surface tension of soap solution is 0.03 N/m.",
            ans: "Soap bubble has 2 free surfaces.\nTotal Surface Area = 2 * (4πr²) = 8πr².\nWork Done = T * ΔA = 0.03 * 8 * 3.1416 * (0.05)²\nWork Done = 1.885 × 10⁻³ Joules."
          }
        ]
      }
    ],
    'Chemistry': [
      {
        ch: 1,
        title: 'Solid State',
        weightage: '5 Marks',
        topics: ['Crystalline vs Amorphous Solids', 'Unit Cells & Crystal Lattices', 'Packing Efficiency in BCC/FCC', 'Point Defects'],
        textbookContent: `
### Unit Cells & Packing Efficiency
1. **Simple Cubic (SCC):** 1 atom per cell, Packing efficiency = 52.4%.
2. **Body Centered Cubic (BCC):** 2 atoms per cell, Packing efficiency = 68%.
3. **Face Centered Cubic (FCC / CCP):** 4 atoms per cell, Packing efficiency = 74%.
        `,
        solutions: [
          {
            q: "Q1. Calculate the packing efficiency of a Face Centered Cubic (FCC) unit cell.",
            ans: "For FCC, radius r = a / (2√2). Volume of 4 atoms = 4 * (4/3 π r³). Total volume of cube = a³. Packing Efficiency = (Volume of atoms / Volume of cell) * 100 = 74%."
          }
        ]
      }
    ]
  }
};

// Official Previous Year Board Question Papers (PYQs) Dataset
export const MSB_PYQ_DATABASE = {
  '10': [
    { year: 'March 2024', title: 'Science & Technology Part 1 Board Paper', marks: '40 Marks', time: '2 Hours', downloadUrl: 'https://www.shaalaa.com/question-papers/maharashtra-state-board-10th-standard-board-exam-science-and-technology-1-question-paper' },
    { year: 'July 2023', title: 'Science & Technology Part 1 Supplementary Paper', marks: '40 Marks', time: '2 Hours', downloadUrl: 'https://www.shaalaa.com/question-papers/maharashtra-state-board-10th-standard-board-exam-science-and-technology-1-question-paper' },
    { year: 'March 2023', title: 'Mathematics Algebra Board Question Paper', marks: '40 Marks', time: '2 Hours', downloadUrl: 'https://www.shaalaa.com/question-papers/maharashtra-state-board-10th-standard-board-exam-algebra-question-paper' }
  ],
  '12': [
    { year: 'February 2024', title: 'HSC Physics Official Board Question Paper', marks: '70 Marks', time: '3 Hours', downloadUrl: 'https://www.shaalaa.com/question-papers/maharashtra-state-board-12th-board-exam-physics-question-paper' },
    { year: 'July 2023', title: 'HSC Physics Supplementary Exam Paper', marks: '70 Marks', time: '3 Hours', downloadUrl: 'https://www.shaalaa.com/question-papers/maharashtra-state-board-12th-board-exam-physics-question-paper' },
    { year: 'March 2023', title: 'HSC Chemistry Official Board Question Paper', marks: '70 Marks', time: '3 Hours', downloadUrl: 'https://www.shaalaa.com/question-papers/maharashtra-state-board-12th-board-exam-chemistry-question-paper' }
  ]
};