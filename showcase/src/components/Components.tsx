import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./Components.css";

interface Feature {
  title: string;
  description: string;
  icon: string;
  tech: string[];
  highlights: string[];
  category: "Components" | "Hooks" | "Contexts" | "Wrappers" | "UI";
}

const features: Feature[] = [
  {
    title: "ICU MessageFormat",
    icon: "📝",
    description:
      "Industry-standard message formatting with powerful features. Full ICU syntax support including variables, plural, select, selectordinal, and formatters for number, date, and time.",
    tech: ["ICU", "CLDR", "FormatJS"],
    category: "Components",
    highlights: [
      "Full ICU syntax: variables, plural, select, selectordinal",
      "Number formatting: integer, currency, percent",
      "Date and time formatting with locale support",
      "Nested messages up to 4 levels deep",
      "Message caching for performance (<1ms)",
      "Unicode ICU and CLDR specification compliant",
    ],
  },
  {
    title: "Unlimited Language Support",
    icon: "🌍",
    description:
      "Support for any language with CLDR-compliant plural rules for 37+ languages. Built-in support for 8 languages, with easy registration for any additional language. Automatic plural form selection (one, two, few, many, other) based on count.",
    tech: ["CLDR", "Pluralization", "TypeScript"],
    category: "Components",
    highlights: [
      "8 built-in: EN-US, EN-UK, FR, ES, DE, ZH, JA, UK",
      "37+ CLDR plural rules (Arabic, Russian, Polish, Welsh, etc.)",
      "Register any language - no limits",
      "Automatic plural form selection by count",
      "Complex pluralization (one/two/few/many/other)",
      "Type-safe language codes",
    ],
  },
  {
    title: "Component Architecture",
    icon: "🏗️",
    description:
      "Register translation components with full type safety. Component-based organization with string keys, validation, and automatic fallback support.",
    tech: ["TypeScript", "Type Safety", "Architecture"],
    category: "Components",
    highlights: [
      "Component registration with ID and name",
      "String key validation and type safety",
      "Multiple instance support",
      "Isolated i18n engines for different contexts",
      "Fluent builder API (I18nBuilder)",
      "Core system strings pre-built",
    ],
  },
  {
    title: "Pluralization & Gender",
    icon: "👥",
    description:
      "Advanced pluralization with automatic form selection and gender-aware translations. Support for male, female, neutral, and other gender forms with context-based selection.",
    tech: ["CLDR", "Pluralization", "Gender"],
    category: "Components",
    highlights: [
      "Automatic plural form selection (one/few/many/other)",
      "Gender-aware translations (male/female/neutral/other)",
      "createPluralString helper for easy setup",
      "createGenderString for gender contexts",
      "CLDR rules for 37 languages",
      "Complex plural forms (Russian, Arabic, Welsh)",
    ],
  },
  {
    title: "Number Formatting",
    icon: "🔢",
    description:
      "Advanced number formatting with thousand separators, currency, and percent. Configurable decimal precision, locale-aware formatting, and smart object handling.",
    tech: ["Intl", "Currency", "Formatting"],
    category: "Components",
    highlights: [
      "Thousand separators (1,000,000)",
      "Currency formatting with codes",
      "Percent formatting with decimals",
      "Configurable decimal precision",
      "CurrencyCode and Timezone object support",
      "Locale-aware number formatting",
    ],
  },
  {
    title: "Template Processing",
    icon: "🔧",
    description:
      "Advanced template processing with component references, alias resolution, enum name resolution, and variable substitution. Context integration with automatic currency, timezone, and language injection.",
    tech: ["Templates", "Context", "TypeScript"],
    category: "Hooks",
    highlights: [
      "Component references: {{Component.key}}",
      "Alias resolution: {{Alias.key}}",
      "Enum name resolution: {{EnumName.value}}",
      "Variable substitution: {variable}",
      "Context variables: {currency}, {timezone}, {language}",
      "GlobalActiveContext integration",
    ],
  },
  {
    title: "Security Hardened",
    icon: "🔒",
    description:
      "Production-grade security with comprehensive protection. Prototype pollution prevention, ReDoS mitigation, XSS protection with HTML escaping, and bounded resource usage.",
    tech: ["Security", "Validation", "Protection"],
    category: "Hooks",
    highlights: [
      "Prototype pollution prevention",
      "ReDoS (Regular Expression DoS) mitigation",
      "XSS protection with HTML escaping",
      "Input validation with configurable limits",
      "Bounded cache and recursion limits",
      "Comprehensive error handling",
    ],
  },
  {
    title: "Error Handling",
    icon: "⚠️",
    description:
      "Comprehensive error classes with translation support and ICU formatting. Type-safe error messages with context, validation errors, and detailed error reporting.",
    tech: ["Errors", "TypeScript", "ICU"],
    category: "UI",
    highlights: [
      "I18nError base class with translation support",
      "ComponentNotFoundError for missing components",
      "StringNotFoundError with fallback handling",
      "ValidationError for input validation",
      "ICU formatting in error messages",
      "Detailed error context and stack traces",
    ],
  },
];

const Components = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="components section" id="components" ref={ref}>
      <motion.div
        className="components-container"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">
          Core <span className="gradient-text">Features</span> & Capabilities
        </h2>
        <p className="components-subtitle">
          Production-ready internationalization library with comprehensive language support
        </p>

        <motion.div
          className="suite-intro"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3>
            A <em>production-ready</em> TypeScript internationalization library with{" "}
            <em>ICU MessageFormat</em> support.
          </h3>
          <p>
            <strong>
              @digitaldefiance/i18n-lib is a comprehensive i18n solution
            </strong>{" "}
            — providing component-based architecture, type-safe translations, and unlimited language support.
            From ICU MessageFormat and pluralization to advanced number formatting and security hardening, 
            this library offers{" "}
            <strong>everything you need</strong> to build globally accessible applications
            with zero internationalization hassle.
          </p>
          <div className="problem-solution">
            <div className="problem">
              <h4>❌ The Challenge: Internationalization Is Complex</h4>
              <ul>
                <li>Implementing proper pluralization across languages</li>
                <li>Handling gender-aware translations</li>
                <li>Managing translations with type safety</li>
                <li>Formatting numbers, dates, and currencies correctly</li>
                <li>Securing against XSS, prototype pollution, and ReDoS</li>
              </ul>
              <p>
                <strong>Result:</strong> You spend weeks implementing i18n infrastructure
                instead of building features.
              </p>
            </div>
            <div className="solution">
              <h4>✅ The Solution: i18n-lib</h4>
              <p>
                <strong>i18n-lib</strong> provides{" "}
                <strong>ICU MessageFormat support</strong> with industry-standard message formatting,
                <strong> 37 language support</strong> with CLDR-compliant plural rules,{" "}
                <strong>component-based architecture</strong> with full type safety,
                and <strong>comprehensive security hardening</strong> against common attacks.
              </p>
              <p>
                Built with <strong>TypeScript</strong> and designed for{" "}
                <strong>production applications</strong>, this library includes 1,738 passing tests
                with 93.22% coverage and comprehensive security features. It provides a complete
                internationalization solution that handles all complexities of multi-language support
                out of the box.
              </p>
            </div>
          </div>
          <div className="value-props">
            <div className="value-prop">
              <strong>📝 ICU MessageFormat</strong>
              <p>
                Industry-standard formatting with plural, select, date/time/number
                formatting, and nested message support
              </p>
            </div>
            <div className="value-prop">
              <strong>🚀 Production Ready</strong>
              <p>
                1,738 passing tests with 93.22% coverage, security hardened,
                and battle-tested in real-world applications
              </p>
            </div>
            <div className="value-prop">
              <strong>🌍 Unlimited Languages</strong>
              <p>
                8 built-in languages, 37+ CLDR plural rules, register any language
                with automatic plural form selection
              </p>
            </div>
            <div className="value-prop">
              <strong>🔒 Security Hardened</strong>
              <p>
                Protection against XSS, prototype pollution, ReDoS with bounded
                resource usage and input validation
              </p>
            </div>
          </div>
        </motion.div>

        <div className="components-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="component-card card"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className="component-header">
                <div className="component-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <span
                  className={`component-badge ${feature.category.toLowerCase()}`}
                >
                  {feature.category}
                </span>
              </div>

              <p className="component-description">{feature.description}</p>

              <ul className="component-highlights">
                {feature.highlights.map((highlight, i) => (
                  <li key={i}>{highlight}</li>
                ))}
              </ul>

              <div className="component-tech">
                {feature.tech.map((tech) => (
                  <span key={tech} className="tech-badge">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Components;
