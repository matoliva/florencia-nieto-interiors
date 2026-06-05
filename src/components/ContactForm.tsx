import { useState, useRef, type FormEvent } from 'react';

interface Translations {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  projectAddress: string;
  message: string;
  preferredContact: string;
  preferredContactEmail: string;
  preferredContactPhone: string;
  source: string;
  sourceReferral: string;
  sourceGoogle: string;
  sourceInstagram: string;
  sourceArchipro: string;
  sourceLinkedin: string;
  sourceOther: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successMessage: string;
  error: string;
  errorFirstName: string;
  errorLastName: string;
  errorEmail: string;
  errorEmailInvalid: string;
}

interface Props {
  translations: Translations;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

function clearField(prev: Record<string, string>, field: string): Record<string, string> {
  const next = { ...prev };
  delete next[field];
  return next;
}

export default function ContactForm({ translations: tr }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [submitterName, setSubmitterName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const loadedAt = useRef(Date.now());

  function validate(data: FormData): Record<string, string> {
    const e: Record<string, string> = {};
    if (!data.get('firstName')?.toString().trim()) e.firstName = tr.errorFirstName;
    if (!data.get('lastName')?.toString().trim()) e.lastName = tr.errorLastName;
    const email = data.get('email')?.toString().trim() ?? '';
    if (!email) e.email = tr.errorEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = tr.errorEmailInvalid;
    return e;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrorField = ['firstName', 'lastName', 'email'].find(f => errs[f]);
      if (firstErrorField) {
        const el = document.getElementById(firstErrorField) as HTMLElement | null;
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.focus();
      }
      return;
    }
    setErrors({});
    setStatus('submitting');

    const name = formData.get('firstName')?.toString() ?? '';

    try {
      const payload = {
        ...Object.fromEntries(formData.entries()),
        elapsed: Date.now() - loadedAt.current,
      };
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitterName(name);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <h2 className="text-display-h1 mb-6">
          {tr.successTitle.replace('{name}', submitterName)}
        </h2>
        <p className="text-body text-text-secondary">{tr.successMessage}</p>
      </div>
    );
  }

  const preferredContactOptions = [
    { value: 'email', label: tr.preferredContactEmail },
    { value: 'phone', label: tr.preferredContactPhone },
  ];

  const sourceOptions = [
    { value: 'referral',  label: tr.sourceReferral },
    { value: 'google',    label: tr.sourceGoogle },
    { value: 'instagram', label: tr.sourceInstagram },
    { value: 'archipro',  label: tr.sourceArchipro },
    { value: 'linkedin',  label: tr.sourceLinkedin },
    { value: 'other',     label: tr.sourceOther },
  ];

  const errorStyle = { color: 'var(--color-feedback-error)' };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot: hidden from real users, bots fill it automatically */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, overflow: 'hidden' }} aria-hidden="true">
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">

        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="firstName" className="form-label">
            {tr.firstName}<span className="text-accent-gold ml-1">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            maxLength={100}
            className={`form-field pb-3${errors.firstName ? ' form-field-error' : ''}`}
            onChange={() => setErrors(prev => clearField(prev, 'firstName'))}
          />
          {errors.firstName && (
            <span className="font-body text-xs tracking-wide" style={errorStyle}>{errors.firstName}</span>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="lastName" className="form-label">
            {tr.lastName}<span className="text-accent-gold ml-1">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            maxLength={100}
            className={`form-field pb-3${errors.lastName ? ' form-field-error' : ''}`}
            onChange={() => setErrors(prev => clearField(prev, 'lastName'))}
          />
          {errors.lastName && (
            <span className="font-body text-xs tracking-wide" style={errorStyle}>{errors.lastName}</span>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="email" className="form-label">
            {tr.email}<span className="text-accent-gold ml-1">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            maxLength={254}
            className={`form-field pb-3${errors.email ? ' form-field-error' : ''}`}
            onChange={() => setErrors(prev => clearField(prev, 'email'))}
          />
          {errors.email && (
            <span className="font-body text-xs tracking-wide" style={errorStyle}>{errors.email}</span>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="phone" className="form-label">{tr.phone}</label>
          <input id="phone" name="phone" type="tel" maxLength={30} className="form-field pb-3" />
        </div>

        <div className="flex flex-col gap-2 w-full md:col-span-2">
          <label htmlFor="projectAddress" className="form-label">{tr.projectAddress}</label>
          <input id="projectAddress" name="projectAddress" type="text" maxLength={200} className="form-field pb-3" />
        </div>

        <div className="flex flex-col gap-2 w-full md:col-span-2">
          <label htmlFor="message" className="form-label">{tr.message}</label>
          <textarea
            id="message"
            name="message"
            rows={3}
            maxLength={2000}
            className="form-field py-3 resize-none"
          />
        </div>

        <fieldset className="flex flex-col gap-2 w-full border-0 p-0 m-0">
          <legend className="form-label mb-4">{tr.preferredContact}</legend>
          <div className="flex flex-col gap-4">
            {preferredContactOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="preferredContact" value={opt.value} className="radio-field" />
                <span className="text-sm text-text-primary">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2 w-full border-0 p-0 m-0">
          <legend className="form-label mb-4">{tr.source}</legend>
          <div className="flex flex-col gap-4">
            {sourceOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="source" value={opt.value} className="radio-field" />
                <span className="text-sm text-text-primary">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="md:col-span-2 flex flex-col items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="group inline-flex items-center gap-3 font-body uppercase tracking-widest text-sm text-text-primary border-b border-text-primary pb-1 hover:text-text-secondary transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? tr.submitting : tr.submit}
            {status !== 'submitting' && (
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            )}
          </button>
          {status === 'error' && (
            <p className="text-body text-sm text-center" style={errorStyle}>{tr.error}</p>
          )}
        </div>

      </div>
    </form>
  );
}
