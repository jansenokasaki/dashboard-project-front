document.addEventListener('DOMContentLoaded', function () {
    // const backendBaseUrl = 'http://localhost:5000/api';
    const backendBaseUrl = 'https://dashboard-project-backend.vercel.app/api'; // Coloque aqui a URL de produção do backend
 // Endereço do back-end

    // Selecionar elementos da página
    const saveProductBtn = document.getElementById('save-product-btn');
    const productsList = document.getElementById('products-list');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productQuantityInput = document.getElementById('product-quantity');
    const weatherResultDiv = document.getElementById('weather-result');

    // Função para buscar o clima de Recife
    async function fetchWeather() {
        try {
            const response = await fetch(`${backendBaseUrl}/weather`);
            if (!response.ok) {
                throw new Error('Erro ao buscar clima');
            }

            const data = await response.json();
            weatherResultDiv.innerHTML = `
                <h3>Clima em ${data.name}</h3>
                <p>Temperatura: ${data.main.temp} °C</p>
                <p>Clima: ${data.weather[0].description}</p>
            `;
        } catch (error) {
            weatherResultDiv.innerHTML = `<p>Erro ao buscar clima: ${error.message}</p>`;
        }
    }

    // Função para salvar (criar/editar) um produto
    saveProductBtn.addEventListener('click', async function () {
        const id = productIdInput.value.trim(); // Verificar o valor do ID
        const name = productNameInput.value.trim();
        const price = parseFloat(productPriceInput.value);
        const quantity = parseInt(productQuantityInput.value, 10);

        if (!name || isNaN(price) || isNaN(quantity)) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        try {
            let response;
            if (id) {
                // Atualizar produto
                response = await fetch(`${backendBaseUrl}/products/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, price, quantity })
                });

                if (!response.ok) {
                    throw new Error('Erro ao atualizar produto');
                }
                alert('Produto atualizado com sucesso!');
            } else {
                // Criar produto
                response = await fetch(`${backendBaseUrl}/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, price, quantity })
                });

                if (!response.ok) {
                    throw new Error('Erro ao criar produto');
                }
                alert('Produto criado com sucesso!');
            }

            // Resetar formulário e atualizar lista de produtos
            resetForm();
            fetchProducts();
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    });

    // Função para buscar todos os produtos
    async function fetchProducts() {
        try {
            const response = await fetch(`${backendBaseUrl}/products`);
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos');
            }

            const products = await response.json();
            productsList.innerHTML = ''; // Limpar lista antes de adicionar novos produtos

            products.forEach(product => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    ${product.name} - R$ ${product.price} (Quantidade: ${product.quantity})
                    <div class="action-buttons">
                        <button class="edit" onclick="editProduct('${product._id}')">Editar</button>
                        <button onclick="deleteProduct('${product._id}')">Deletar</button>
                    </div>
                `;
                productsList.appendChild(listItem);
            });
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    }

    // Função para editar um produto
    window.editProduct = function (id) {
        fetch(`${backendBaseUrl}/products/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar produto');
                }
                return response.json();
            })
            .then(product => {
                // Preencher o formulário com os dados do produto para edição
                productIdInput.value = product._id;
                productNameInput.value = product.name;
                productPriceInput.value = product.price;
                productQuantityInput.value = product.quantity;

                // Scroll para o formulário para melhorar a usabilidade
                productNameInput.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => alert(`Erro ao buscar produto: ${error.message}`));
    };

    // Função para deletar um produto
    window.deleteProduct = async function (id) {
        try {
            await fetch(`${backendBaseUrl}/products/${id}`, {
                method: 'DELETE'
            });
            alert('Produto deletado com sucesso!');
            fetchProducts();
        } catch (error) {
            alert(`Erro ao deletar produto: ${error.message}`);
        }
    };

    // Função para resetar o formulário
    function resetForm() {
        productIdInput.value = '';
        productNameInput.value = '';
        productPriceInput.value = '';
        productQuantityInput.value = '';
    }

    // Carregar os produtos inicialmente e buscar o clima de Recife
    fetchProducts();
    fetchWeather();
});
