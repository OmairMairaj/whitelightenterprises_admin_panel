'use client';
import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Cookies from 'js-cookie';

const formSchema = z.object({
  Email: z.string().min(1, { message: 'El correo electrónico es obligatorio' }),
  PassKey: z.string().min(1, { message: 'La contraseña es obligatoria' })
});

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, setLoading] = useState(false);
  const [showPassKey, setShowPassKey] = useState(false);
  const defaultValues = {
    Email: '',
    PassKey: ''
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiEndpoint}/admin/login`,
        data
      );

      if (response.data.operation == true) {
        Cookies.set('token', response.data.token, { expires: 7 });
        Cookies.set('userData', JSON.stringify(response.data.userData), {
          expires: 7
        });
        alert('¡Inicio de sesión exitoso!');
        window.location.href = `/dashboard`;
      } else {
        alert('¡Inicio de sesión fallido!');
      }
    } catch (error) {
      alert('Ocurrió un error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          <FormField
            control={form.control}
            name="Email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Introduce tu correo electrónico..."
                    disabled={loading}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      form.clearErrors('Email');
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="PassKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassKey ? 'text' : 'password'}
                      placeholder="Introduce tu contraseña..."
                      disabled={loading}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.clearErrors('PassKey');
                      }}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassKey((prev) => !prev)}
                    >
                      {showPassKey ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div style={{ height: '15px' }}></div>
          <div>
            <Button disabled={loading} className="ml-auto w-full" type="submit">
              Proceder a Iniciar Sesión
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}

export default function UserAuthPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
