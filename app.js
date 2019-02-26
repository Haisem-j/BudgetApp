var budgetController = (function (){
    var Expense =function(id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
    }
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    var Income =function(id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    }
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum = sum + current.value
        });
        data.total[type] = sum;
    }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val){
            var newItem;
            
            //create new id based on last id position
            if(data.allItems[type].length > 0){
            var ID  = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            //create based on type
            if(type == 'exp'){
                newItem = new Expense(ID, des, val);
            }else if(type == 'inc'){
                newItem = new Income(ID, des, val);
            }
            //new items are stored in the data object
            data.allItems[type].push(newItem);

            //return new item
            return newItem;
        },

        calculateBudget: function(){
            // calculate total expenses and incomes
            calculateTotal('exp');
            calculateTotal('inc');
               
            // calculate income - expenses
            data.budget = data.total.inc - data.total.exp;

            //calculate percentage
            if(data.total.inc > 0){
            data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            }else{
                data.percentage = -1;
            }

            
        },

        getBudget: function(){
            return {
                budget: data.budget,
                income: data.total.inc,
                expenses: data.total.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(curr, ind, arr){
                curr.calcPercentage(data.total.inc);
            });
            
        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            });
            return allPerc;
        },
        deleteItem: function(type, id){
            var index, ids;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }

        }
    }

})();


var uiController = (function (){
    var domStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentLabel: '.budget__expenses--percentage',
        container: '.container',
        itempercent: '.item__percentage'
    };
        var formatNumber = function(num,type){
            //comma separating thousands
            var numSplit, int, dec;
            num = Math.abs(num);
            num = num.toFixed(2);

            numSplit = num.split('.');
            int = numSplit[0];
            if(int.length > 3){
                int = int.substr(0,int.length - 3) + ',' +int.substr(int.length - 3, 3);
            }

            dec = numSplit[1];
            if(type == 'exp'){
                return '-' + ' ' + int +'.'+ dec;
            }else{
                return '+ ' + int +'.'+ dec;
            }
        };
    return{
        getInput: function(){
            return{
            type : document.querySelector(domStrings.inputType).value, //Value is either inc or exp
            description : document.querySelector(domStrings.inputDesc).value,
            value : parseFloat(document.querySelector(domStrings.inputValue).value),
            };
        },
        

        clearFields: function(){
            var fields, fieldsArray;
            fields = document.querySelectorAll(domStrings.inputDesc + ', ' + domStrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(curr, ind, arr){
                curr.value = "";
            });

            fieldsArray[0].focus();
        },

        addListItem: function(object, type){
            //Create HTML string with place holder text
            var html, element;
            if(type == 'exp'){
            element = domStrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete">   <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>   </div>    </div></div>';      
        }else if(type == 'inc'){
            element = domStrings.incomeContainer;            
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>   </div></div></div>'
        }
            //Replace placeholder text with some actual data
            newHTML = html.replace('%id%', object.id);
            newHTML = newHTML.replace('%description%', object.desc);
            newHTML = newHTML.replace('%value%', formatNumber(object.value), type);

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);  
        },
        
        displayBudget: function(obj){
            document.querySelector(domStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(domStrings.incomeLabel).textContent = obj.income;
            document.querySelector(domStrings.expenseLabel).textContent = obj.expenses;

            if(obj.percentage > 0){
            document.querySelector(domStrings.percentLabel).textContent = obj.percentage + "%";
            }else{
            document.querySelector(domStrings.percentLabel).textContent = '---'
            }

        },

        displayPercentages: function(percentages){
            var fields;
            fields = document.querySelectorAll(domStrings.itempercent);

            var nodeListForEach = function(list, callback){
                for(var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            }

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            })
        },

        getDomStrings: function(){
            return domStrings;
        }
    };
})();

var controller = (function (budgetCtrl, uiCtrl){
var setupEventListeners = function(){
    var DOM = uiCtrl.getDomStrings();
    // listens for a click on the check button
    //if clicked ctrlAdditem is called
    document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem); 

    document.addEventListener('keypress', function(event){
        //listens for the enter button to be pressed
          if(event.keyCode === 13 || event.which === 13){
              ctrlAddItem();
          }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
}
    var updateBudget = function(){
        var budget;
        //Calculate budget

        budgetController.calculateBudget();
        
        //Return budget
        budget = budgetController.getBudget();

        //Display the budget on UI 
       uiCtrl.displayBudget(budget);

    };

    var updatePercentage = function(){
        // Calc percentage
        budgetCtrl.calculatePercentages();

        //read percentage from the budget controller
        var percentages = budgetCtrl.getPercentages(); 

        //update ui with new percentages
        uiCtrl.displayPercentages(percentages);


    };
    var ctrlAddItem = function(){
        var input, newItem;
        
        //Get the input data
        input = uiCtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
        //Add item to BudgetController
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        //Add item to BudgetController
        uiCtrl.addListItem(newItem, input.type);

        //Clear fields
        uiCtrl.clearFields(); 
        }
        //Calculate and update budget
        updateBudget();


        /// update the percentages
        updatePercentage();
    };
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID =itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);


            //Delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            ///Delete from UI
            uiCtrl.deleteListItem(itemID);

            //Update and show new budget
            updateBudget();


            /// update the percentages
            updatePercentage();
        }
    }
    
    return {
        init: function(){
            console.log('Application started');
            setupEventListeners();
            uiCtrl.displayBudget({
                budget: 0,
                income: 0,
                expenses: 0,
                percentage: -1});
        }
    }
})(budgetController, uiController);


controller.init();


