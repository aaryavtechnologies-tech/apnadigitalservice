import React from 'react';
import { 
  CreditCard, 
  Vote, 
  Car, 
  Truck, 
  UserPlus, 
  FileEdit, 
  Fingerprint, 
  FileText,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function ServiceIcon({ name, size = 24, color = 'currentColor' }) {
  switch (name) {
    case 'Vote':
      return <Vote size={size} color={color} strokeWidth={2} />;
    case 'CreditCard':
      return <CreditCard size={size} color={color} strokeWidth={2} />;
    case 'Car':
      return <Car size={size} color={color} strokeWidth={2} />;
    case 'Truck':
      return <Truck size={size} color={color} strokeWidth={2} />;
    case 'UserPlus':
      return <UserPlus size={size} color={color} strokeWidth={2} />;
    case 'FileEdit':
      return <FileEdit size={size} color={color} strokeWidth={2} />;
    case 'Fingerprint':
      return <Fingerprint size={size} color={color} strokeWidth={2} />;
    case 'ShieldCheck':
      return <ShieldCheck size={size} color={color} strokeWidth={2} />;
    case 'Sparkles':
      return <Sparkles size={size} color={color} strokeWidth={2} />;
    default:
      return <FileText size={size} color={color} strokeWidth={2} />;
  }
}
