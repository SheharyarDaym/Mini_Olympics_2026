'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Settings,
  Key,
  Save,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Gamepad2,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  Users,
  Mail,
  Server,
  Send,
  Tag,
} from 'lucide-react';

type GamePricing = {
  id: number;
  game_name: string;
  gender: string;
  price: number;
  players: number | null;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [smtpSaveSuccess, setSmtpSaveSuccess] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [settings, setSettings] = useState({
    openai_api_key: '',
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_email: '',
    smtp_password: '',
    smtp_from_name: 'FCIT Sports Society',
  });
  // Defaults must match lib/email.ts so "what you see = what gets sent" until you save custom templates
  const [emailTemplates, setEmailTemplates] = useState({
    email_registration_submitted_online_subject: 'Mini Olympics 2026 Registration',
    email_registration_submitted_online_body: `<h2>Welcome to Mini Olympics 2026! 🏆</h2>
<p>Dear {{name}},</p>
<p>Thank you for registering for the FCIT Sports Mini Olympics 2026. We're excited to have you on board!</p>
<p>Your registration has been received and is currently being processed.</p>
<p><strong>Ticket #:</strong> {{regNum}}</p>
<p><strong>Reference / Slip ID:</strong> {{slipId}}</p>
<p><strong>Team name:</strong> {{teamName}}</p>
<p><strong>Registered game(s):</strong></p>
<ul>
{{gamesList}}
</ul>
<p><strong>What's Next?</strong></p>
<ul>
  <li>You'll be notified once your payment is verified</li>
  <li>Join the WhatsApp groups for your registered games</li>
  <li>Stay tuned for match schedules</li>
</ul>
<p>Good luck and may the best athlete win!</p>`,
    email_registration_submitted_cash_subject: 'Mini Olympics 2026 Registration',
    email_registration_submitted_cash_body: `<h2>Welcome to Mini Olympics 2026! 🏆</h2>
<p>Dear {{name}},</p>
<p>Thank you for registering for the FCIT Sports Mini Olympics 2026. We're excited to have you on board!</p>
<p>Your registration has been received and is currently being processed.</p>
<p><strong>Ticket #:</strong> {{regNum}}</p>
<p><strong>Reference / Slip ID:</strong> {{slipId}}</p>
<p><strong>Team name:</strong> {{teamName}}</p>
<p><strong>Registered game(s):</strong></p>
<ul>
{{gamesList}}
</ul>
<p><strong>What's Next?</strong></p>
<ul>
  <li>Submit the cash at the desk to complete the registration</li>
  <li>Join the WhatsApp groups for your registered games</li>
  <li>Stay tuned for match schedules</li>
</ul>
<p>Good luck and may the best athlete win!</p>`,
    email_payment_received_subject: 'Mini Olympics 2026 Registration',
    email_payment_received_body: `<h2>Payment Confirmed ✅</h2>
<p>Dear {{name}},</p>
<p>Your payment for <strong>Mini Olympics 2026</strong> has been received and verified.</p>
<p><strong>Ticket #:</strong> {{regNum}}</p>
<p><strong>Reference ID:</strong> {{slipId}}</p>
<p>You are all set. We look forward to seeing you at the event.</p>`,
    email_payment_rejected_subject: 'Mini Olympics 2026 Registration',
    email_payment_rejected_body: `<h2>Payment Verification Required</h2>
<p>Dear {{name}},</p>
<p>We were unable to verify your payment for <strong>Mini Olympics 2026</strong> (Ticket #{{regNum}}).</p>
<p><strong>Reference ID:</strong> {{slipId}}</p>
<p>{{paymentAction}}</p>`,
  });
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [templatesSaveSuccess, setTemplatesSaveSuccess] = useState(false);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<'registration_online' | 'registration_cash' | 'payment_received' | 'payment_rejected'>('registration_online');

  // Games state
  const [games, setGames] = useState<GamePricing[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [gameDialogOpen, setGameDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<GamePricing | null>(null);
  const [savingGame, setSavingGame] = useState(false);
  const [gameForm, setGameForm] = useState({
    game_name: '',
    boys_price: '',
    boys_players: '',
    girls_price: '',
    girls_players: '',
  });

  const [coupons, setCoupons] = useState<{ id: string; code: string; discount_percent: number; is_active: boolean }[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [couponForm, setCouponForm] = useState({ code: '', discountPercent: '' });
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadGames();
    loadCoupons();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        const d = data.data;
        setSettings({
          openai_api_key: d.openai_api_key || '',
          smtp_host: d.smtp_host || 'smtp.gmail.com',
          smtp_port: d.smtp_port || '587',
          smtp_email: d.smtp_email || '',
          smtp_password: d.smtp_password || '',
          smtp_from_name: d.smtp_from_name || 'FCIT Sports Society',
        });
        setEmailTemplates(prev => ({
          email_registration_submitted_online_subject: d.email_registration_submitted_online_subject !== undefined ? d.email_registration_submitted_online_subject : prev.email_registration_submitted_online_subject,
          email_registration_submitted_online_body: d.email_registration_submitted_online_body !== undefined ? d.email_registration_submitted_online_body : prev.email_registration_submitted_online_body,
          email_registration_submitted_cash_subject: d.email_registration_submitted_cash_subject !== undefined ? d.email_registration_submitted_cash_subject : prev.email_registration_submitted_cash_subject,
          email_registration_submitted_cash_body: d.email_registration_submitted_cash_body !== undefined ? d.email_registration_submitted_cash_body : prev.email_registration_submitted_cash_body,
          email_payment_received_subject: d.email_payment_received_subject !== undefined ? d.email_payment_received_subject : prev.email_payment_received_subject,
          email_payment_received_body: d.email_payment_received_body !== undefined ? d.email_payment_received_body : prev.email_payment_received_body,
          email_payment_rejected_subject: d.email_payment_rejected_subject !== undefined ? d.email_payment_rejected_subject : prev.email_payment_rejected_subject,
          email_payment_rejected_body: d.email_payment_rejected_body !== undefined ? d.email_payment_rejected_body : prev.email_payment_rejected_body,
        }));
      }
    } catch (error) {
      console.error('Load settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGames = async () => {
    setLoadingGames(true);
    try {
      const res = await fetch('/api/admin/games', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setGames(data.data);
      }
    } catch (error) {
      console.error('Load games error:', error);
    } finally {
      setLoadingGames(false);
    }
  };

  const loadCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await fetch('/api/admin/coupons', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data || []);
      }
    } catch (error) {
      console.error('Load coupons error:', error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleCreateCoupon = async () => {
    const code = couponForm.code.trim().toUpperCase();
    const pct = parseFloat(couponForm.discountPercent);
    if (!code) {
      alert('Enter a coupon code');
      return;
    }
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      alert('Discount percent must be between 1 and 100');
      return;
    }
    setSavingCoupon(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, discount_percent: pct }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponForm({ code: '', discountPercent: '' });
        loadCoupons();
      } else {
        alert(data.error || 'Failed to create coupon');
      }
    } catch (e) {
      alert('Failed to create coupon');
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon? It will no longer be usable.')) return;
    setDeletingCouponId(id);
    try {
      const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadCoupons();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (e) {
      alert('Failed to delete coupon');
    } finally {
      setDeletingCouponId(null);
    }
  };

  const handleSaveApiKey = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'openai_api_key', value: settings.openai_api_key }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to save: ' + data.error);
      }
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSmtp = async () => {
    setSavingSmtp(true);
    setSmtpSaveSuccess(false);
    try {
      // Save all SMTP settings
      const smtpSettings = [
        { key: 'smtp_host', value: settings.smtp_host },
        { key: 'smtp_port', value: settings.smtp_port },
        { key: 'smtp_email', value: settings.smtp_email },
        { key: 'smtp_password', value: settings.smtp_password },
        { key: 'smtp_from_name', value: settings.smtp_from_name },
      ];

      for (const setting of smtpSettings) {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(setting),
        });
      }

      setSmtpSaveSuccess(true);
      setTimeout(() => setSmtpSaveSuccess(false), 3000);
    } catch (error) {
      alert('Failed to save SMTP settings');
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleSaveEmailTemplates = async () => {
    setSavingTemplates(true);
    setTemplatesSaveSuccess(false);
    try {
      const keys = Object.keys(emailTemplates) as (keyof typeof emailTemplates)[];
      for (const key of keys) {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: emailTemplates[key] }),
        });
      }
      setTemplatesSaveSuccess(true);
      setTimeout(() => setTemplatesSaveSuccess(false), 3000);
    } catch (error) {
      alert('Failed to save email templates');
    } finally {
      setSavingTemplates(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings.smtp_email || !settings.smtp_password) {
      alert('Please configure SMTP email and password first');
      return;
    }

    setTestingEmail(true);
    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: settings.smtp_email }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Test email sent successfully! Check your inbox.');
      } else {
        alert('Failed to send test email: ' + data.error);
      }
    } catch (error) {
      alert('Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleOpenGameDialog = (game?: GamePricing) => {
    if (game) {
      // Find all entries for this game
      const gameName = game.game_name;
      const boysEntry = games.find(g => g.game_name === gameName && g.gender === 'boys');
      const girlsEntry = games.find(g => g.game_name === gameName && g.gender === 'girls');
      
      setEditingGame(game);
      setGameForm({
        game_name: gameName,
        boys_price: boysEntry?.price?.toString() || '',
        boys_players: boysEntry?.players?.toString() || '',
        girls_price: girlsEntry?.price?.toString() || '',
        girls_players: girlsEntry?.players?.toString() || '',
      });
    } else {
      setEditingGame(null);
      setGameForm({
        game_name: '',
        boys_price: '',
        boys_players: '',
        girls_price: '',
        girls_players: '',
      });
    }
    setGameDialogOpen(true);
  };

  const handleSaveGame = async () => {
    if (!gameForm.game_name.trim()) {
      alert('Game name is required');
      return;
    }

    setSavingGame(true);
    try {
      // Save boys pricing if provided
      if (gameForm.boys_price) {
        await fetch('/api/admin/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_name: gameForm.game_name.trim(),
            gender: 'boys',
            price: parseFloat(gameForm.boys_price),
            players: gameForm.boys_players ? parseInt(gameForm.boys_players) : null,
          }),
        });
      } else if (editingGame) {
        // Delete boys entry if price is removed
        await fetch(`/api/admin/games?game_name=${encodeURIComponent(gameForm.game_name)}&gender=boys`, {
          method: 'DELETE',
        });
      }

      // Save girls pricing if provided
      if (gameForm.girls_price) {
        await fetch('/api/admin/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_name: gameForm.game_name.trim(),
            gender: 'girls',
            price: parseFloat(gameForm.girls_price),
            players: gameForm.girls_players ? parseInt(gameForm.girls_players) : null,
          }),
        });
      } else if (editingGame) {
        // Delete girls entry if price is removed
        await fetch(`/api/admin/games?game_name=${encodeURIComponent(gameForm.game_name)}&gender=girls`, {
          method: 'DELETE',
        });
      }

      setGameDialogOpen(false);
      loadGames();
    } catch (error) {
      alert('Failed to save game');
    } finally {
      setSavingGame(false);
    }
  };

  const handleDeleteGame = async (gameName: string) => {
    if (!confirm(`Delete "${gameName}" (both male and female pricing)?`)) return;

    try {
      // Delete both genders
      await fetch(`/api/admin/games?game_name=${encodeURIComponent(gameName)}&gender=boys`, {
        method: 'DELETE',
      });
      await fetch(`/api/admin/games?game_name=${encodeURIComponent(gameName)}&gender=girls`, {
        method: 'DELETE',
      });
      loadGames();
    } catch (error) {
      alert('Failed to delete game');
    }
  };

  // Group games by name for display
  const groupedGames = games.reduce((acc, game) => {
    if (!acc[game.game_name]) {
      acc[game.game_name] = { boys: null, girls: null };
    }
    if (game.gender === 'boys') {
      acc[game.game_name].boys = game;
    } else {
      acc[game.game_name].girls = game;
    }
    return acc;
  }, {} as Record<string, { boys: GamePricing | null; girls: GamePricing | null }>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 pt-16 lg:pt-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <Settings className="h-5 w-5 text-white" />
          </div>
          Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">Configure system settings (Super Admin only)</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* SMTP Email Settings */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration (SMTP)
            </CardTitle>
            <CardDescription className="text-blue-100">
              Configure email settings for sending notifications and announcements
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpEmail" className="text-sm font-medium">Email Address *</Label>
                  <Input
                    id="smtpEmail"
                    type="email"
                    value={settings.smtp_email}
                    onChange={(e) => setSettings({ ...settings, smtp_email: e.target.value })}
                    autoComplete="email"
                    placeholder="sports@pucit.edu.pk"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPassword" className="text-sm font-medium">App Password *</Label>
                  <div className="relative">
                    <Input
                      id="smtpPassword"
                      type={showSmtpPassword ? 'text' : 'password'}
                      value={settings.smtp_password}
                      onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                      autoComplete="off"
                      placeholder="16-character app password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Generate from{' '}
                    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      Google App Passwords
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpFromName" className="text-sm font-medium">From Name</Label>
                  <Input
                    id="smtpFromName"
                    value={settings.smtp_from_name}
                    onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
                    autoComplete="organization"
                    placeholder="FCIT Sports Society"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost" className="text-sm font-medium">SMTP Server</Label>
                    <Input
                      id="smtpHost"
                      value={settings.smtp_host}
                      onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort" className="text-sm font-medium">Port</Label>
                    <Input
                      id="smtpPort"
                      value={settings.smtp_port}
                      onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <Server className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Gmail SMTP Settings:</p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• Server: <code className="bg-blue-100 px-1 rounded">smtp.gmail.com</code></li>
                        <li>• Port: <code className="bg-blue-100 px-1 rounded">587</code> (TLS)</li>
                        <li>• Enable 2-Step Verification on Google Account</li>
                        <li>• Use App Password, not your Gmail password</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSaveSmtp}
                    disabled={savingSmtp}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {savingSmtp ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : smtpSaveSuccess ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {smtpSaveSuccess ? 'Saved!' : 'Save SMTP'}
                  </Button>
                  <Button
                    onClick={handleTestEmail}
                    disabled={testingEmail || !settings.smtp_email}
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    {testingEmail ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Test Email
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Automated Email Templates — one at a time with dropdown */}
        <Card className="border-0 shadow-lg flex flex-col min-h-[420px]">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Automated Email Templates
            </CardTitle>
            <CardDescription className="text-teal-100">
              Edit one template at a time. Placeholders: name, regNum, slipId, teamName, gamesList. For Payment rejected: paymentAction.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col flex-1 min-h-0">
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Template</Label>
                <Select value={selectedEmailTemplate} onValueChange={(v) => setSelectedEmailTemplate(v as typeof selectedEmailTemplate)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registration_online">Registration submitted (online)</SelectItem>
                    <SelectItem value="registration_cash">Registration submitted (cash)</SelectItem>
                    <SelectItem value="payment_received">Payment received (confirmed)</SelectItem>
                    <SelectItem value="payment_rejected">Payment rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 flex-1 min-h-0 flex flex-col">
                <Label className="text-sm">Subject</Label>
                <Input
                  value={
                    selectedEmailTemplate === 'registration_online'
                      ? emailTemplates.email_registration_submitted_online_subject
                      : selectedEmailTemplate === 'registration_cash'
                        ? emailTemplates.email_registration_submitted_cash_subject
                        : selectedEmailTemplate === 'payment_received'
                          ? emailTemplates.email_payment_received_subject
                          : emailTemplates.email_payment_rejected_subject
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (selectedEmailTemplate === 'registration_online') setEmailTemplates(t => ({ ...t, email_registration_submitted_online_subject: v }));
                    else if (selectedEmailTemplate === 'registration_cash') setEmailTemplates(t => ({ ...t, email_registration_submitted_cash_subject: v }));
                    else if (selectedEmailTemplate === 'payment_received') setEmailTemplates(t => ({ ...t, email_payment_received_subject: v }));
                    else setEmailTemplates(t => ({ ...t, email_payment_rejected_subject: v }));
                  }}
                  placeholder="Mini Olympics 2026 Registration"
                />
                <Label className="text-sm">Body (HTML)</Label>
                <textarea
                  value={
                    selectedEmailTemplate === 'registration_online'
                      ? emailTemplates.email_registration_submitted_online_body
                      : selectedEmailTemplate === 'registration_cash'
                        ? emailTemplates.email_registration_submitted_cash_body
                        : selectedEmailTemplate === 'payment_received'
                          ? emailTemplates.email_payment_received_body
                          : emailTemplates.email_payment_rejected_body
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (selectedEmailTemplate === 'registration_online') setEmailTemplates(t => ({ ...t, email_registration_submitted_online_body: v }));
                    else if (selectedEmailTemplate === 'registration_cash') setEmailTemplates(t => ({ ...t, email_registration_submitted_cash_body: v }));
                    else if (selectedEmailTemplate === 'payment_received') setEmailTemplates(t => ({ ...t, email_payment_received_body: v }));
                    else setEmailTemplates(t => ({ ...t, email_payment_rejected_body: v }));
                  }}
                  rows={8}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-y flex-1 min-h-[180px]"
                  placeholder="<p>Dear {{name}},</p>..."
                />
              </div>
            </div>
            <Button onClick={handleSaveEmailTemplates} disabled={savingTemplates} className="mt-4 bg-teal-500 hover:bg-teal-600">
              {savingTemplates ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : templatesSaveSuccess ? <CheckCircle className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {templatesSaveSuccess ? 'Saved!' : 'Save templates'}
            </Button>
          </CardContent>
        </Card>

        {/* Coupons — same-size card with scrollable small coupon cards */}
        <Card className="border-0 shadow-lg flex flex-col min-h-[420px]">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Coupon Codes
            </CardTitle>
            <CardDescription className="text-amber-100">
              Create coupon codes for a percentage discount. Participants enter the code at checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col flex-1 min-h-0">
            <div className="flex flex-wrap gap-3 items-end mb-4">
              <div className="space-y-1">
                <Label className="text-sm">Code</Label>
                <Input
                  value={couponForm.code}
                  onChange={(e) => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. EARLY10"
                  className="w-32"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Discount %</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={couponForm.discountPercent}
                  onChange={(e) => setCouponForm(f => ({ ...f, discountPercent: e.target.value }))}
                  placeholder="10"
                  className="w-20"
                />
              </div>
              <Button onClick={handleCreateCoupon} disabled={savingCoupon} size="sm" className="bg-amber-500 hover:bg-amber-600">
                {savingCoupon ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add
              </Button>
            </div>
            <div className="flex-1 min-h-[220px] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2">
              {loadingCoupons ? (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                </div>
              ) : coupons.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[200px] text-sm text-slate-500">
                  No coupons yet. Add one above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {coupons.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-shadow min-h-[72px]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-mono font-semibold text-slate-800 truncate">{c.code}</p>
                        <p className="text-xs text-slate-600">{c.discount_percent}% off</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCoupon(c.id)}
                        disabled={deletingCouponId === c.id}
                        className="flex-shrink-0 h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {deletingCouponId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Key Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              AI API Configuration
            </CardTitle>
            <CardDescription className="text-purple-100">
              Configure OpenAI API key for AI-powered match generation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium">OpenAI API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.openai_api_key}
                    onChange={(e) => setSettings({ ...settings, openai_api_key: e.target.value })}
                    placeholder="sk-..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Get your API key from{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">
                  OpenAI Dashboard
                </a>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveApiKey}
                disabled={saving}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saveSuccess ? 'Saved!' : 'Save API Key'}
              </Button>
              
              {settings.openai_api_key && (
                <span className="flex items-center gap-1 text-sm text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  API key configured
                </span>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">Important Notes:</p>
                  <ul className="text-xs text-amber-700 mt-1 list-disc list-inside space-y-1">
                    <li>The API key is stored securely in the database</li>
                    <li>OpenAI charges for API usage - monitor your usage</li>
                    <li>Use GPT-3.5-turbo for cost-effective match generation</li>
                    <li>Only Super Admins can view and modify this setting</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Games & Pricing Management */}
        <Card className="border-0 shadow-lg lg:col-span-1">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Games & Pricing
                </CardTitle>
                <CardDescription className="text-emerald-100">
                  Manage games, prices, and team sizes
                </CardDescription>
              </div>
              <Button
                onClick={() => handleOpenGameDialog()}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Game
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {loadingGames ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            ) : Object.keys(groupedGames).length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Gamepad2 className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                <p>No games configured</p>
                <p className="text-sm">Click "Add Game" to get started</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {Object.entries(groupedGames).map(([name, { boys, girls }]) => (
                  <div key={name} className="border rounded-lg p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate">{name}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {boys && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              ♂ Rs.{boys.price}
                              {boys.players && boys.players > 1 && (
                                <span className="text-blue-500">({boys.players}p)</span>
                              )}
                            </span>
                          )}
                          {girls && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded">
                              ♀ Rs.{girls.price}
                              {girls.players && girls.players > 1 && (
                                <span className="text-pink-500">({girls.players}p)</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenGameDialog(boys || girls!)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4 text-slate-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteGame(name)}
                          className="h-8 w-8 p-0 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Game Add/Edit Dialog */}
      <Dialog open={gameDialogOpen} onOpenChange={setGameDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-emerald-600" />
              {editingGame ? 'Edit Game' : 'Add New Game'}
            </DialogTitle>
            <DialogDescription>
              {editingGame ? 'Update game pricing and settings' : 'Add a new game with pricing'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Game Name *</Label>
              <Input
                value={gameForm.game_name}
                onChange={(e) => setGameForm({ ...gameForm, game_name: e.target.value })}
                placeholder="e.g., Cricket, Football, Chess"
                disabled={!!editingGame}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Male Pricing */}
              <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 flex items-center gap-1">
                  <span className="text-lg">♂</span> Male
                </h4>
                <div className="space-y-2">
                  <Label className="text-sm text-blue-700">Price (Rs.)</Label>
                  <Input
                    type="number"
                    value={gameForm.boys_price}
                    onChange={(e) => setGameForm({ ...gameForm, boys_price: e.target.value })}
                    placeholder="e.g., 200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-blue-700">Team Size</Label>
                  <Input
                    type="number"
                    value={gameForm.boys_players}
                    onChange={(e) => setGameForm({ ...gameForm, boys_players: e.target.value })}
                    placeholder="1 for singles"
                  />
                </div>
              </div>

              {/* Female Pricing */}
              <div className="space-y-3 p-3 bg-pink-50 rounded-lg">
                <h4 className="font-medium text-pink-800 flex items-center gap-1">
                  <span className="text-lg">♀</span> Female
                </h4>
                <div className="space-y-2">
                  <Label className="text-sm text-pink-700">Price (Rs.)</Label>
                  <Input
                    type="number"
                    value={gameForm.girls_price}
                    onChange={(e) => setGameForm({ ...gameForm, girls_price: e.target.value })}
                    placeholder="e.g., 200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-pink-700">Team Size</Label>
                  <Input
                    type="number"
                    value={gameForm.girls_players}
                    onChange={(e) => setGameForm({ ...gameForm, girls_players: e.target.value })}
                    placeholder="1 for singles"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Leave price empty to disable the game for that gender. Team size of 1 means individual game.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setGameDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveGame}
                disabled={savingGame || !gameForm.game_name.trim()}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {savingGame ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Game
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
