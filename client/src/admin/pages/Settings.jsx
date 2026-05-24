import React, { useState, useEffect, useCallback } from 'react';
import { FiCloud, FiLock, FiSave, FiUpload } from 'react-icons/fi';
import Toast from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { fetchAdminSettings, saveAdminSettings, backupAdminDatabase } from '../api/adminApi';

const Settings = () => {
  const [security, setSecurity] = useState({ requireBackupConfirmation: true, securityPasscodeSet: false });
  const [securityForm, setSecurityForm] = useState({ currentPasscode: '', newPasscode: '', confirmPasscode: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [showBackupConfirm, setShowBackupConfirm] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadSettings = useCallback(async () => {
    try {
      const response = await fetchAdminSettings();
      const settings = response.data || {};
      setSecurity({
        requireBackupConfirmation: Boolean(settings.security?.requireBackupConfirmation),
        securityPasscodeSet: Boolean(settings.security?.securityPasscodeSet)
      });
      setError('');
      setSettingsLoaded(true);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError(err?.response?.data?.message || 'Unable to load settings.');
      showToast('Unable to load admin settings.', 'error');
      setSettingsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError('');
    try {
        const payload = {
          security: {
            requireBackupConfirmation: security.requireBackupConfirmation
          }
        };

      if (securityForm.newPasscode) {
        payload.newPasscode = securityForm.newPasscode;
        payload.confirmPasscode = securityForm.confirmPasscode;
        if (security.securityPasscodeSet) {
          payload.currentPasscode = securityForm.currentPasscode;
        }
      }

      const response = await saveAdminSettings(payload);
      const updated = response.data.settings;
      if (updated) {
        setSecurity({
          requireBackupConfirmation: Boolean(updated.security.requireBackupConfirmation),
          securityPasscodeSet: Boolean(updated.security.securityPasscodeSet)
        });
      }
      if (securityForm.newPasscode) {
        setSecurityForm({ currentPasscode: '', newPasscode: '', confirmPasscode: '' });
      }
      showToast('Settings saved successfully.');
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err?.response?.data?.message || 'Unable to save settings.');
      showToast(err?.response?.data?.message || 'Unable to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackupConfirm = async () => {
    setIsBackupLoading(true);
    try {
      const response = await backupAdminDatabase();
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/json' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `expense-splitter-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Database backup downloaded successfully.');
    } catch (err) {
      console.error('Backup failed:', err);
      showToast(err?.response?.data?.message || 'Database backup failed.', 'error');
      setError(err?.response?.data?.message || 'Unable to create database backup.');
    } finally {
      setIsBackupLoading(false);
      setShowBackupConfirm(false);
    }
  };

  const handleSecuritySave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const payload = {
        security: {
          requireBackupConfirmation: security.requireBackupConfirmation
        }
      };

      if (securityForm.newPasscode) {
        payload.newPasscode = securityForm.newPasscode;
        payload.confirmPasscode = securityForm.confirmPasscode;
        if (security.securityPasscodeSet) {
          payload.currentPasscode = securityForm.currentPasscode;
        }
      }

      const response = await saveAdminSettings(payload);
      const updated = response.data.settings;
      if (updated) {
        setSecurity({
          requireBackupConfirmation: Boolean(updated.security.requireBackupConfirmation),
          securityPasscodeSet: Boolean(updated.security.securityPasscodeSet)
        });
      }
      setSecurityForm({ currentPasscode: '', newPasscode: '', confirmPasscode: '' });
      setShowSecurityModal(false);
      showToast('Security settings updated successfully.');
    } catch (err) {
      console.error('Failed to save security settings:', err);
      setError(err?.response?.data?.message || 'Unable to save security settings.');
      showToast(err?.response?.data?.message || 'Unable to save security settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSecurityField = (field, value) => {
    setSecurity((prev) => ({ ...prev, [field]: value }));
  };

  if (!settingsLoaded && !error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-white shadow-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Settings</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Admin configuration</h2>
          </div>
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 rounded-3xl px-5 py-3 text-sm font-semibold text-white transition ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500'}`}
          >
            <FiSave className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {error && (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-800 shadow-sm">{error}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Security & backups</h3>
          <p className="mt-3 text-sm text-slate-500">Keep your admin console secure and preserve data backups.</p>
          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={() => {
                if (security.requireBackupConfirmation) {
                  setShowBackupConfirm(true);
                } else {
                  handleBackupConfirm();
                }
              }}
              disabled={isBackupLoading}
              className={`inline-flex items-center gap-3 rounded-3xl px-5 py-3 text-sm font-semibold text-white transition ${isBackupLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-950 hover:bg-slate-800'}`}
            >
              <FiCloud className="h-4 w-4" /> {isBackupLoading ? 'Backing up...' : 'Backup database'}
            </button>
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Security</p>
                  <p className="mt-2 text-sm text-slate-500">Configure backup protection and administrative security settings.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                  {security.securityPasscodeSet ? 'Passcode configured' : 'No passcode set'}
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">Backup confirmation</p>
                  <p className="mt-2 text-sm text-slate-500">Require confirmation before downloading a backup.</p>
                  <button
                    type="button"
                    onClick={() => updateSecurityField('requireBackupConfirmation', !security.requireBackupConfirmation)}
                    className={`mt-3 inline-flex items-center gap-2 rounded-3xl px-4 py-2 text-sm font-semibold ${security.requireBackupConfirmation ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {security.requireBackupConfirmation ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(true)}
                  className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  <FiLock className="h-4 w-4" /> Manage security settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Branding & uploads</h3>
        <p className="mt-3 text-sm text-slate-500">Update the admin panel logo and customization assets for your app.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <FiUpload className="h-4 w-4" /> Upload logo
          </button>
          <button className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <FiUpload className="h-4 w-4" /> Upload favicon
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showBackupConfirm}
        title="Confirm database backup"
        message="Backup will create a downloadable JSON snapshot of your MongoDB data. Continue?"
        onConfirm={handleBackupConfirm}
        onCancel={() => setShowBackupConfirm(false)}
        isLoading={isBackupLoading}
        confirmLabel="Backup now"
      />

      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
          <div className="w-full max-w-2xl rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Security settings</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Manage security behavior</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                disabled={isSaving}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
              >
                ×
              </button>
            </div>
            <form className="mt-6 space-y-5" onSubmit={handleSecuritySave}>
              <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Require backup confirmation</p>
                    <p className="mt-2 text-sm text-slate-500">Skip the confirmation step when downloading backups.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSecurityField('requireBackupConfirmation', !security.requireBackupConfirmation)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${security.requireBackupConfirmation ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {security.requireBackupConfirmation ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Current passcode</label>
                  <input
                    type="password"
                    value={securityForm.currentPasscode}
                    onChange={(e) => setSecurityForm((prev) => ({ ...prev, currentPasscode: e.target.value }))}
                    placeholder="Current passcode"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">New passcode</label>
                  <input
                    type="password"
                    value={securityForm.newPasscode}
                    onChange={(e) => setSecurityForm((prev) => ({ ...prev, newPasscode: e.target.value }))}
                    placeholder="New passcode"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Confirm new passcode</label>
                <input
                  type="password"
                  value={securityForm.confirmPasscode}
                  onChange={(e) => setSecurityForm((prev) => ({ ...prev, confirmPasscode: e.target.value }))}
                  placeholder="Confirm passcode"
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                />
              </div>

              <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  {security.securityPasscodeSet
                    ? 'A security passcode is already configured for your admin panel.'
                    : 'No passcode has been configured yet. Set one now to protect sensitive admin operations.'}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`inline-flex items-center justify-center rounded-3xl px-5 py-3 text-sm font-semibold text-white transition ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                >
                  {isSaving ? 'Saving...' : 'Save security settings'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
