'use client';

import React, { useState, useEffect, useMemo, Fragment } from "react";
// Importaciones Mantenidas
import { useSession, signOut } from "next-auth/react";
// ❌ ArrowLeft ya no se usa
// ✅ Icono añadido: Menu para el botón de navegación
import { Search, ShoppingBag, Loader2, LogOut, ArrowLeft, Menu } from 'lucide-react'; 
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { AddToCartModal } from '@/components/cart/AddToCartModal'; 
import { CartSummaryModal } from '@/components/cart/carritohistorial'; 
import { ClientLoginModal } from '@/components/auth/ClientLoginModal'; 
import { ClientRegisterModal } from '@/components/auth/ClientRegisterModal'; 

import { ProductCard, Product} from '@/components/cart/ProductCards';


// --- Tipos de Datos (Mantenidos) ---
interface CartItem {
    productId: number;
    name: string;
    pricePerUnit: number;
    quantity: number;
}
type Cart = Record<number, CartItem>;


export default function CatalogPage() {
    // --- LÓGICA 100% MANTENIDA ---
    const { data: session, status } = useSession(); 
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [cart, setCart] = useState<Cart>({});
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); 
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const [activeFilter, setActiveFilter] = useState("All");

    const openLogin = () => { setIsLoginModalOpen(true); setIsRegisterModalOpen(false); };
    const openRegister = () => { setIsRegisterModalOpen(true); setIsLoginModalOpen(false); };
    
    const handleLoginSuccess = () => {
        setIsLoginModalOpen(false);
        location.reload(); 
    };

    // 1. Cargar productos (Mantenido)
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
    
    // 2. Cargar/Guardar carrito en localStorage (Mantenido)
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem('userCart');
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        } catch (e) {
            console.error("Error al cargar carrito desde localStorage:", e);
            localStorage.removeItem('userCart');
        }
    }, []); 

    useEffect(() => {
        try {
            if (Object.keys(cart).length > 0) {
                localStorage.setItem('userCart', JSON.stringify(cart));
            } else if (localStorage.getItem('userCart')) {
                localStorage.removeItem('userCart');
            }
        } catch (e) {
            console.error("Error al guardar carrito en localStorage:", e);
        }
    }, [cart]); 
    
    // Lógica de filtrado (Mantenido)
    const filteredProducts = useMemo(() => {
        let processedProducts = products.filter((p) => !/galleta|pan|torta/i.test(p.name));
        
        if (activeFilter !== "All") {
            processedProducts = processedProducts.filter((p) => 
                p.type.toLowerCase() === activeFilter.toLowerCase() || 
                p.flavor.toLowerCase() === activeFilter.toLowerCase()
            );
        }
        
        if (!searchTerm) { return processedProducts; }
        const term = searchTerm.toLowerCase();
        return processedProducts.filter((p) => p.name.toLowerCase().includes(term) || p.type.toLowerCase().includes(term) || p.flavor.toLowerCase().includes(term));
    }, [products, searchTerm, activeFilter]);

    // Función para abrir el modal de añadir (Mantenido)
    const handleOpenAddModal = (product: Product) => { 
        setSelectedProduct(product); 
        setIsAddModalOpen(true); 
    };

    // Lógica de añadir al carrito (Mantenido)
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

    // Calcular ítems para el ícono (Mantenido)
    const totalItemsInCart = useMemo(() => {
        return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    // Función de chequeo de sesión (Mantenido)
    const handleOpenSummaryChecked = () => {
        if (status === 'loading') return; 

        if (session) {
            setIsSummaryModalOpen(true); 
        } else {
            setIsLoginModalOpen(true); 
        }
    };

    const filters = ["All", "Sweet", "Sour", "New", "Tropical"];

    // --- FIN DE LA LÓGICA ---

    return (
        <Fragment> 
            
            {/* --- 1. BOTONES DE NAVEGACIÓN (HEADER/FIXED) --- */}
            
            {/* ❌ Eliminado el div "fixed top-20 left-8 z-50" del botón Volver */}
            
            {/* 🔴 NUEVO BOTÓN DE MENÚ (Posicionado en la izquierda como el "Volver" anterior) */}
            <div className="fixed top-20 left-8 z-50"> 
                <Button 
                    variant="outline" 
                    // ⚠️ Nota: Aquí iría tu lógica para abrir el menú lateral (sidebar)
                    onClick={() => console.log('Abrir menú lateral/sidebar')} 
                    className="h-12 w-12 border-2 rounded-full shadow-lg bg-background text-zinc-800 dark:text-zinc-200" 
                    size="icon"
                    title="Abrir Menú"
                >
                    <Menu className="h-6 w-6" /> 
                </Button>
            </div>


            <div className="fixed top-20 right-8 z-50 flex items-center space-x-2">
                {/* ❌ ELIMINADA toda la lógica de botones "Entrar" / "Cerrar Sesión" */}
                {/* Solo se deja el spinner de carga si la sesión está en proceso */}
                {status === 'loading' && (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                )}

                {/* --- 🛍️ Botón de Carrito (Mantenido) --- */}
                <Button 
                    variant="default" 
                    className="relative h-12 w-12 rounded-full shadow-xl"
                    onClick={handleOpenSummaryChecked} 
                    disabled={status === 'loading'}
                    title="Ver Carrito"
                >
                    <ShoppingBag className="h-6 w-6" />
                    {totalItemsInCart > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                            {totalItemsInCart}
                        </span>
                    )}
                </Button>
            </div>


            {/* --- LAYOUT DEL CATÁLOGO --- */}
            {/* Aumentamos el pt para dar más espacio a los botones fijos */}
            <main className="flex-1 pt-32 sm:pt-40"> 

                {/* Barra de Búsqueda (Mantenido) */}
                <div className="px-4 py-3 max-w-xl mx-auto"> 
                    <label className="flex flex-col min-w-40 h-14 w-full">
                        <div className="flex w-full flex-1 items-stretch rounded-full h-full">
                            <div className="text-zinc-500 dark:text-zinc-400 flex border-none bg-zinc-200/50 dark:bg-zinc-800 items-center justify-center pl-5 rounded-l-full border-r-0">
                                <Search className="h-5 w-5" />
                            </div>
                            <input 
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full text-zinc-800 dark:text-zinc-200 focus:outline-0 focus:ring-0 border-none bg-zinc-200/50 dark:bg-zinc-800 focus:border-none h-full placeholder:text-zinc-500 dark:placeholder:text-zinc-400 px-4 text-base font-normal" 
                                placeholder="Buscar productos..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </label>
                </div>

                {/* 🔴 CORRECCIÓN: Contenedor ajustado para evitar desbordamiento horizontal */}
                <div className="px-4 py-2">
                    <div className="flex gap-3 overflow-x-auto whitespace-nowrap justify-start lg:justify-center">
                        {filters.map((filter) => (
                            <button 
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-colors ${
                                    activeFilter === filter 
                                    ? 'bg-primary text-zinc-900' 
                                    : 'bg-zinc-200/50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300/50 dark:hover:bg-zinc-700'
                                }`}
                            >
                                <p className={`text-sm leading-normal ${activeFilter === filter ? 'font-bold' : 'font-medium'}`}>
                                    {filter}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
                

                {/* --- Renderizado de Productos (Mantenido) --- */}
                <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {loading || fetchError || filteredProducts.length === 0 ? (
                        loading || status === 'loading' ? (
                            <div className="text-center py-12"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /><p className="mt-4 text-zinc-500 dark:text-zinc-400">Cargando...</p></div>
                        ) : fetchError ? ( 
                            <div className="text-center py-12 p-4 border border-red-500 bg-red-500/10 text-red-500 rounded-md"><p className="font-bold">Error al cargar productos:</p><p className="text-sm">{fetchError}</p><Button className="mt-4" onClick={() => window.location.reload()}>Recargar Página</Button></div>
                        ) : ( 
                            <p className="text-center text-zinc-500 dark:text-zinc-400 py-12 text-lg">{searchTerm ? `No se encontraron productos para "${searchTerm}"` : "No hay productos disponibles"}</p>
                        )
                    ) : (
                        /* GRILA CORREGIDA: grid-cols-2 desde móvil */
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 justify-items-center max-w-6xl mx-auto">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} {...product} onOpenAddModal={handleOpenAddModal} />
                            ))}
                        </div>
                    )}
                </div>

                {/* --- Botón "Cargar Más" (Mantenido) --- */}
                {!loading && !fetchError && filteredProducts.length > 0 && (
                    <div className="flex px-4 py-6 justify-center">
                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 flex-1 bg-zinc-200/50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-base font-bold hover:bg-zinc-300/50 dark:hover:bg-zinc-700 transition-colors">
                            <span className="truncate">Cargar Más (Demo)</span>
                        </button>
                    </div>
                )}

            </main>


            {/* --- MODALS (Mantenido) --- */}
            <AddToCartModal isOpen={isAddModalOpen} onClose={() => {setIsAddModalOpen(false); setSelectedProduct(null);}} product={selectedProduct} onConfirmAdd={handleAddToCart} />
            <CartSummaryModal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} cart={cart} setCart={setCart} />
            
            {/* Mantenemos los modales, aunque el usuario ya no tenga botón para abrirlos */}
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
            
        </Fragment>
    );
}