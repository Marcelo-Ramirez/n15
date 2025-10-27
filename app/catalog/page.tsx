'use client';

import React, { useState, useEffect, useMemo, Fragment } from "react";
// ✅ Importación de NextAuth
import { useSession, signOut } from "next-auth/react";
import Image from 'next/image';
import { Search, ShoppingCart, Loader2, LogOut } from 'lucide-react'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// ✅ Importación de los Modals
import { AddToCartModal } from '@/components/cart/AddToCartModal'; 
import { CartSummaryModal } from '@/components/cart/carritohistorial'; 
import { ClientLoginModal } from '@/components/auth/ClientLoginModal'; 
import { ClientRegisterModal } from '@/components/auth/ClientRegisterModal'; 


// --- Tipos de Datos (Mantenidos) ---
interface Product {
    id: number;
    name: string;
    type: string;
    flavor: string;
    pricePerUnit: number;
    currentQuantity: number;
    imageUrl?: string | null;
    description?: string | null;
}
interface CartItem {
    productId: number;
    name: string;
    pricePerUnit: number;
    quantity: number;
}
type Cart = Record<number, CartItem>;

interface ProductCardProps extends Product {
    onOpenAddModal: (product: Product) => void; 
}

// --- COMPONENTE TARJETA DE PRODUCTO ---
const ProductCard = (props: ProductCardProps) => {
    const { onOpenAddModal, ...productProps } = props; 
    const { name, description, flavor, pricePerUnit, currentQuantity, imageUrl } = productProps;
    const isOutOfStock = currentQuantity === 0;

    return (
        <Card className="w-full max-w-xs sm:max-w-[320px] md:max-w-md shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between overflow-hidden">
            <div className="relative h-48 bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                    <Image 
                        src={imageUrl} 
                        alt={name} 
                        fill={true} 
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 768px) 90vw, 320px"
                    />
                ) : (
                    <p className="text-muted-foreground text-sm">Imagen no disponible</p>
                )}
            </div>
            <CardHeader className="pt-4 pb-2 space-y-1">
                <CardTitle className="text-xl font-bold">{name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    {description || `Delicioso sabor ${flavor}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-4">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tipo: <span className="font-semibold">{flavor}</span></p>
                </div>
            </CardContent>
            <div className="px-6 pb-6 pt-0 space-y-3">
                <div className="flex justify-between items-center">
                    <p className="text-2xl font-extrabold text-primary">Bs {pricePerUnit.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Stock: {currentQuantity}</p>
                </div>
                <Button 
                    onClick={() => onOpenAddModal(productProps)} 
                    disabled={isOutOfStock}
                    className="w-full"
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isOutOfStock ? 'Agotado' : 'Seleccionar Cantidad'}
                </Button>
            </div>
        </Card>
    );
};
// --- FIN COMPONENTE TARJETA DE PRODUCTO ---


export default function CatalogPage() {
    const { data: session, status } = useSession(); 
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [cart, setCart] = useState<Cart>({});
    
    // Estados para Modals de Transacción
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    // Estados para Modals de Autenticación
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    // Funciones de control de Modals de Autenticación
    const openLogin = () => { setIsLoginModalOpen(true); setIsRegisterModalOpen(false); };
    const openRegister = () => { setIsRegisterModalOpen(true); setIsLoginModalOpen(false); };
    
    const handleLoginSuccess = () => {
        setIsLoginModalOpen(false);
        location.reload(); // Recarga simple para refrescar la sesión
    };


    // 1. Cargar productos
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setFetchError(null);
                const res = await fetch("/api/inventory/products"); 
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                
                if (data.success && Array.isArray(data.products)) {
                    setProducts(data.products); 
                } else {
                    setProducts([]); 
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : "Error desconocido al cargar productos";
                setFetchError(errorMsg); 
                setProducts([]); 
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);
    
    // 2. Cargar/Guardar carrito en localStorage
    useEffect(() => {
        // Cargar al inicio
        try {
            const storedCart = localStorage.getItem('userCart');
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        } catch (e) {
            console.error("Error al cargar carrito desde localStorage:", e);
            localStorage.removeItem('userCart');
        }
    }, []); // Solo al montar el componente

    useEffect(() => {
        // Guardar cada vez que el carrito cambia
        try {
            if (Object.keys(cart).length > 0) {
                localStorage.setItem('userCart', JSON.stringify(cart));
            } else if (localStorage.getItem('userCart')) {
                localStorage.removeItem('userCart');
            }
        } catch (e) {
            console.error("Error al guardar carrito en localStorage:", e);
        }
    }, [cart]); // Se ejecuta cada vez que 'cart' se actualiza
    
    // Lógica de filtrado
    const filteredProducts = useMemo(() => {
        const excludedProducts = products.filter((p) => !/galleta|pan|torta/i.test(p.name));
        if (!searchTerm) { return excludedProducts; }
        const term = searchTerm.toLowerCase();
        return excludedProducts.filter((p) => p.name.toLowerCase().includes(term) || p.type.toLowerCase().includes(term) || p.flavor.toLowerCase().includes(term));
    }, [products, searchTerm]);

    // Función para abrir el modal de añadir
    const handleOpenAddModal = (product: Product) => {
        setSelectedProduct(product); 
        setIsAddModalOpen(true); 
    };

    // Lógica de añadir al carrito (llamada por AddToCartModal)
    const handleAddToCart = (productId: number, quantity: number) => {
        const productToAdd = products.find(p => p.id === productId);
        if (!productToAdd || productToAdd.currentQuantity === 0 || quantity < 1) { return; }

        setCart(prevCart => {
            const existingItem = prevCart[productId];
            const currentTotal = existingItem ? existingItem.quantity : 0;
            const newTotalQuantity = currentTotal + quantity;
            
            if (newTotalQuantity > productToAdd.currentQuantity) {
                alert(`Stock insuficiente. Solo puedes tener ${productToAdd.currentQuantity} unidades en total.`);
                return prevCart;
            }

            const updatedCart = {
                ...prevCart,
                [productId]: { productId, name: productToAdd.name, pricePerUnit: productToAdd.pricePerUnit, quantity: newTotalQuantity }
            };
            return updatedCart;
        });
    };

    // Calcular ítems para el ícono
    const totalItemsInCart = useMemo(() => {
        return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    // ✅ FUNCIÓN CORREGIDA: Verifica la sesión antes de abrir el resumen
    const handleOpenSummaryChecked = () => {
        if (status === 'loading') return; 

        if (session) {
            setIsSummaryModalOpen(true); 
        } else {
            setIsLoginModalOpen(true); 
        }
    };


    return (
        // ✅ Usamos Fragment para evitar div innecesario, ya que el layout padre lo envuelve
        <Fragment> 
            <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                
                {/* Encabezado y Búsqueda */}
                <div className="text-center mb-10 space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Nuestro Catálogo de Gomitas</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Descubre nuestra deliciosa colección de productos.</p>
                    <div className="flex max-w-md mx-auto relative">
                        <Input type="text" placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-16 h-11" />
                        <Button className="absolute right-0 h-11 w-14" disabled={loading}><Search className="h-4 w-4" /></Button>
                    </div>
                </div>

                {/* 🛒 ICONO DE CARRITO Y BOTÓN DE LOGIN/LOGOUT */}
                {/* ⚠️ NOTA: Este elemento fijo puede superponerse al menú del layout padre. Considera moverlo al layout. */}
                <div className="fixed top-20 right-8 z-50 flex items-center space-x-2">
                    {/* Botón de Autenticación/Perfil */}
                    {status === 'authenticated' ? (
                        <Button variant="outline" size="icon" onClick={() => signOut()} className="rounded-full h-12 w-12 border-2 border-primary" title="Cerrar Sesión">
                            <LogOut className="h-6 w-6 text-primary" />
                        </Button>
                    ) : status === 'unauthenticated' ? (
                        <Button onClick={openLogin} className="rounded-full px-4 h-12" size="sm" title="Iniciar Sesión">
                            Entrar
                        </Button>
                    ) : (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    )}

                    {/* Botón del Carrito */}
                    <Button 
                        variant="default" 
                        className="relative h-12 w-12 rounded-full shadow-xl"
                        onClick={handleOpenSummaryChecked} 
                        disabled={status === 'loading'}
                        title="Ver Carrito"
                    >
                        <ShoppingCart className="h-6 w-6" />
                        {totalItemsInCart > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                {totalItemsInCart}
                            </span>
                        )}
                    </Button>
                </div>


                {/* --- Renderizado Condicional de Productos --- */}
                {loading || fetchError || filteredProducts.length === 0 ? (
                    loading || status === 'loading' ? (
                        <div className="text-center py-12"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /><p className="mt-4 text-muted-foreground">Cargando...</p></div>
                    ) : fetchError ? ( 
                        <div className="text-center py-12 p-4 border border-destructive bg-destructive/10 text-destructive rounded-md"><p className="font-bold">Error al cargar productos:</p><p className="text-sm">{fetchError}</p><Button className="mt-4" onClick={() => window.location.reload()}>Recargar Página</Button></div>
                    ) : ( 
                        <p className="text-center text-muted-foreground py-12 text-lg">{searchTerm ? `No se encontraron productos para "${searchTerm}"` : "No hay productos disponibles"}</p>
                    )
                ) : (
                    /* Grid para Productos */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center max-w-6xl mx-auto">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} {...product} onOpenAddModal={handleOpenAddModal} />
                        ))}
                    </div>
                )}
            </div>

            {/* MODALS */}
            <AddToCartModal isOpen={isAddModalOpen} onClose={() => {setIsAddModalOpen(false); setSelectedProduct(null);}} product={selectedProduct} onConfirmAdd={handleAddToCart} />
            <CartSummaryModal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} cart={cart} setCart={setCart} />
            
            {/* MODALS DE AUTENTICACIÓN */}
            <ClientLoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
                onLoginSuccess={handleLoginSuccess}
                onOpenRegister={openRegister} 
            />
            <ClientRegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onOpenLogin={openLogin} 
            />
            
            {/* ❌ Footer ya no es necesario aquí */}
        </Fragment>
    );
}