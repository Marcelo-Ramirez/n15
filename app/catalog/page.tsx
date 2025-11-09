'use client';

import React, { useState, useEffect, useMemo, Fragment, useCallback } from "react";
import { useSession} from "next-auth/react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter"; 
import { Button } from "@/components/ui/button";
import { AddToCartModal } from '@/components/cart/AddToCartModal'; 
import { CartSummaryModal } from '@/components/cart/carritohistorial'; 
import { ClientLoginModal } from '@/components/auth/ClientLoginModal'; 
import { ClientRegisterModal } from '@/components/auth/ClientRegisterModal'; 

import { ProductCard, Product} from '@/components/cart/ProductCards';

const PAGE_LIMIT = 10; 

interface CartItem {
    productId: number;
    name: string;
    pricePerUnit: number;
    quantity: number;
}
type Cart = Record<number, CartItem>;

interface ProductResponse {
    success: boolean;
    products: Product[];
    totalCount: number; 
}


export default function CatalogPage() {
    const { data: session, status } = useSession(); 
    
    // --- ESTADOS DE BÚSQUEDA ---
    const [products, setProducts] = useState<Product[]>([]); 
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    
    // 1. ESTADO REAL: Dispara la petición al servidor (Actualizado por el debounce)
    const [searchTerm, setSearchTerm] = useState("");
    // 2. ESTADO LOCAL: Vinculado directamente al campo de input (Actualizado inmediatamente)
    const [localSearchTerm, setLocalSearchTerm] = useState(""); 
    
    const [activeFilter, setActiveFilter] = useState("All");

    // --- ESTADOS DE PAGINACIÓN ---
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false); 
    const [isInitialLoad, setIsInitialLoad] = useState(true); 

    // --- ESTADOS DE CARRITO Y MODALES (Mantenidos) ---
    const [cart, setCart] = useState<Cart>({});
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); 
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const openLogin = () => { setIsLoginModalOpen(true); setIsRegisterModalOpen(false); };
    const openRegister = () => { setIsRegisterModalOpen(true); setIsLoginModalOpen(false); };
    
    const handleLoginSuccess = () => {
        setIsLoginModalOpen(false);
        location.reload(); 
    };

    // --- FUNCIONES DE PAGINACIÓN/BÚSQUEDA ---
    
    // 1. Lógica principal de carga de productos (Server-Side)
    const fetchProducts = useCallback(async () => {
        const query = new URLSearchParams();
        query.append('page', String(page));
        query.append('limit', String(PAGE_LIMIT));
        if (searchTerm) query.append('search', searchTerm);
        if (activeFilter !== "All") query.append('filter', activeFilter);
        
        const url = `/api/inventory/products?${query.toString()}`;

        try {
            if(isInitialLoad) setLoading(true); 
            setFetchError(null);
            
            const res = await fetch(url); 
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
            }
            
            const data: ProductResponse = await res.json();
            
            if (data.success && Array.isArray(data.products)) {
                setProducts(prevProducts => page === 1 ? data.products : [...prevProducts, ...data.products]);
                const currentTotal = page === 1 ? data.products.length : products.length + data.products.length;
                setHasMore(currentTotal < data.totalCount);
            } else {
                setProducts([]); 
                setHasMore(false);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Error desconocido al cargar productos";
            setFetchError(errorMsg); 
            if (page === 1) setProducts([]); 
            setHasMore(false);
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
        }
    }, [page, searchTerm, activeFilter]); 

    // 2. Control de cambios en filtros y búsqueda (Llama a fetchProducts)
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]); 
    
    // 3. Lógica del Debounce (Retraso de 300ms)
    useEffect(() => {
        if (localSearchTerm === searchTerm) return;

        const timerId = setTimeout(() => {
            handleSearchOrFilterChange(localSearchTerm, activeFilter);
        }, 300); 

        return () => {
            clearTimeout(timerId);
        };
    }, [localSearchTerm, activeFilter]); 
    
    
    // 4. Resetear página y productos (Se llama desde el debounce o el click de filtro)
    const handleSearchOrFilterChange = (newTerm: string, newFilter: string) => {
        if (newTerm !== searchTerm || newFilter !== activeFilter) {
            setIsInitialLoad(true); 
            setProducts([]); 
            setPage(1); 
            setSearchTerm(newTerm);
            setActiveFilter(newFilter);
        }
    };

    // 5. Función para el botón "Cargar Más"
    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };


    // --- LÓGICA DE CARRITO (Mantenida) ---

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
    
    const handleOpenAddModal = (product: Product) => { 
        setSelectedProduct(product); 
        setIsAddModalOpen(true); 
    };

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

    const totalItemsInCart = useMemo(() => {
        return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    const handleOpenSummaryChecked = () => {
        if (status === 'loading') return; 

        if (session) {
            setIsSummaryModalOpen(true); 
        } else {
            setIsLoginModalOpen(true); 
        }
    };

    const filters = ["All", "Sweet", "Sour", "New", "Tropical"];

    // --- RENDERIZADO ---

    return (
        <Fragment>
            <PublicHeader />

            {/* --- LAYOUT DEL CATÁLOGO --- */}
            <main className="min-h-screen bg-background pt-24"> 

                {/* Barra de Búsqueda (CORREGIDA CON DEBOUNCE) */}
                <div className="px-4 py-3 max-w-xl mx-auto"> 
                    <label className="flex flex-col min-w-40 h-14 w-full">
                        <div className="flex w-full flex-1 items-stretch rounded-full h-full">
                            <div className="text-zinc-500 dark:text-zinc-400 flex border-none bg-zinc-200/50 dark:bg-zinc-800 items-center justify-center pl-5 rounded-l-full border-r-0">
                                <Search className="h-5 w-5" />
                            </div>
                            <input 
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full text-zinc-800 dark:text-zinc-200 focus:outline-0 focus:ring-0 border-none bg-zinc-200/50 dark:bg-zinc-800 focus:border-none h-full placeholder:text-zinc-500 dark:placeholder:text-zinc-400 px-4 text-base font-normal" 
                                placeholder="Buscar productos..." 
                                value={localSearchTerm} // VINCULADO AL ESTADO LOCAL
                                // Actualiza el estado local, lo que activa el Debounce
                                onChange={(e) => setLocalSearchTerm(e.target.value)} 
                            />
                        </div>
                    </label>
                </div>

                {/* Filtros de Categoría (Mantenido: Usa el 'searchTerm' real) */}
                <div className="px-4 py-2">
                    <div className="flex gap-3 overflow-x-auto whitespace-nowrap justify-start lg:justify-center">
                        {filters.map((filter) => (
                            <button 
                                key={filter}
                                onClick={() => handleSearchOrFilterChange(searchTerm, filter)}
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
                    {isInitialLoad && loading ? (
                        <div className="text-center py-12"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /><p className="mt-4 text-zinc-500 dark:text-zinc-400">Cargando...</p></div>
                    ) : fetchError ? ( 
                        <div className="text-center py-12 p-4 border border-red-500 bg-red-500/10 text-red-500 rounded-md"><p className="font-bold">Error al cargar productos:</p><p className="text-sm">{fetchError}</p><Button className="mt-4" onClick={() => window.location.reload()}>Recargar Página</Button></div>
                    ) : products.length === 0 ? ( 
                        <p className="text-center text-zinc-500 dark:text-zinc-400 py-12 text-lg">{searchTerm || activeFilter !== "All" ? `No se encontraron productos para "${searchTerm}" o el filtro "${activeFilter}"` : "No hay productos disponibles"}</p>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 justify-items-center max-w-6xl mx-auto">
                            {products.map((product) => (
                                <ProductCard key={product.id} {...product} onOpenAddModal={handleOpenAddModal} />
                            ))}
                        </div>
                    )}
                </div>

                {/* --- Botón "Cargar Más" (Mantenido) --- */}
                {hasMore && (
                    <div className="flex px-4 py-6 justify-center">
                        <button 
                            onClick={handleLoadMore}
                            disabled={loading} 
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 flex-1 bg-zinc-200/50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-base font-bold hover:bg-zinc-300/50 dark:hover:bg-zinc-700 transition-colors relative"
                        >
                            {loading && page > 1 ? (
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : null}
                            <span className="truncate">
                                {loading && page > 1 ? "Cargando más..." : "Cargar Más Productos"}
                            </span>
                        </button>
                    </div>
                )}


                {/* --- MODALS (Mantenido) --- */}
                <AddToCartModal isOpen={isAddModalOpen} onClose={() => {setIsAddModalOpen(false); setSelectedProduct(null);}} product={selectedProduct} onConfirmAdd={handleAddToCart} />
                <CartSummaryModal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} cart={cart} setCart={setCart} />
                
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
                
            </main>
            <PublicFooter />
        </Fragment>
    );
}