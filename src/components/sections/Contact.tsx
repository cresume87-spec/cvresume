'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Section id="contact" className="py-14">
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold">Contact us</h2>
          <p className="mt-2 text-slate-600">MOCK: Leave a message — we usually reply within 1 business day.</p>
          <div className="mt-6 grid gap-3 text-sm text-slate-700">
            <div>Company: MOCK COMPANY LTD</div>
            <div>Reg: 00000000</div>
            <div>Address: 123 Mock Street, City, Country</div>
            <div>Email: hello@example.com</div>
            <div>Phone: +00 0000 000000</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Name"
                name="name"
                placeholder="Alex Johnson"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Message"
                  name="message"
                  rows={5}
                  placeholder="Tell us about your use case..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full" size="lg">
                  Send
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </Section>
  );
}




